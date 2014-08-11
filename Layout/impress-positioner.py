#!/usr/bin/env python
import sys, re

fin = sys.argv[1]

if len(sys.argv) > 2:
	fout = sys.argv[2]
else:
	fout = fin[:fin.rfind('.')] + '-lay.html'

xloc = 0
yloc = 0

xmin = 0
xmax = 1
ymin = 0
ymax = 1

x_pos = {'' : 0}
y_pos = {'' : 0}

def parse_pos(term, dic, id=None):

	rot = False
	parent = None

	p = term.split(':')

	if len(p) == 1:
		n = int(p[0])
	elif len(p) == 2:
		if p[0].startswith('_'):
			rot = True
			p[0] = p[0][1:]

		parent = p[0]
		if parent not in dic:
			print "No step {} for relative position".format(p[0])
			exit(-1)

		n = dic[parent] + int(p[1])
	else:
		print "Invalid position specifier {}".format(term)
		exit(-1)

	return n, rot, parent


def update_pos(x, y, id=None, rel=False):
	global xloc, xmin, xmax, yloc, ymin, ymax, x_pos, y_pos

	if id is not None:
		x_pos[id] = x

	xloc = x

	xmin = min(xmin, xloc)
	xmax = max(xmax, xloc)

	if id is not None:
		y_pos[id] = y

	yloc = y

	ymin = min(ymin, yloc)
	ymax = max(ymax, yloc)

def process_absolute(l, id, angle):
	xm = re.search('data-x=.([\-0-9]*).',l)
	ym = re.search('data-y=.([\-0-9]*).',l)
	if xm is None or ym is None:
		if not xm and ym:
			print("WARN: only one of data-x, data-y found in {}".format(l))
		return False

	x, d1, d2 = parse_pos(xm.group(1), x_pos, id)
	y, d1, d2 = parse_pos(ym.group(1), y_pos, id)

	update_pos(x, y, id)

	return True

def process_relative(l, id, angle):
	from math import sin, cos, radians
	xm = re.search('data-x-rel=.([_a-zA-Z:\-0-9]*).',l)
	ym = re.search('data-y-rel=.([_a-zA-Z:\-0-9]*).',l)
	if xm is None or ym is None:
		if not xm and ym:
			print("WARN: only one of data-x-rel, data-y-rel found in {}".format(l))
		return False

	xt, rx, parent = parse_pos(xm.group(1), x_pos, id)
	yt, ry, parent = parse_pos(ym.group(1), y_pos, id)

	angle = radians(angle)

	if rx or ry:
		x =   xt * cos(angle) + yt * sin(angle)
		y = - xt * sin(angle) + yt * cos(angle)
	else:
		x, y = xt, yt

	if parent:
		x += x_pos[parent]
		y += y_pos[parent]
	else:
		x += xloc
		y += yloc

	update_pos(x, y, id)

	return True

def process1(l):

	need_rewrite = False

	idm = re.search('id=.([a-zA-Z\-0-9]*).', l)
	if idm is not None:
		id = idm.group(1)
	else:
		id = None

	angm = re.search('data-rotate=.([\-0-9]*).', l)
	if angm is not None:
		angle = float(angm.group(1))
	else:
		angle = 0

	process_absolute(l, id, angle)

	need_rewrite = process_relative(l, id, angle)


	# Rewrite pos
	if need_rewrite:
		xstr = "data-x='{}'".format(int(xloc))
		ystr = "data-y='{}'".format(int(yloc))

		l = re.sub('data-x-rel=.([_a-zA-Z:\-0-9]*).', xstr, l)
		l = re.sub('data-y-rel=.([_a-zA-Z:\-0-9]*).', ystr, l)

	return l

def process2(l):
	r = re.search('<div id=[\'"](over[a-zA-Z0-9]*)[\'"] .*/>', l)
	if r is not None:
		idtag = r.group(1)
		xscale = (1000 + xmax - xmin) / 1250.
		yscale = (1000 + ymax - ymin) / 1000.
		scale = max(xscale, yscale) 
		# Rewrite the overview slide, if present
		overview = '	<div id="{}" class="step" data-x="{}" data-y="{}" data-scale="{:.2}">&nbsp</div>'.format(
			idtag,
			(xmax - xmin) / 2,
			(ymax - ymin) / 2 - (50 * scale),
			scale
			)
		return overview

	return l

# Load and relative position processing
fdata = []
with open(fin, 'r') as f:
	for l in f:
		fdata.append(process1(l))

# Second pass, global position info (e.g. overview slides)
fdata2 = []
for l in fdata:
	fdata2.append(process2(l))

with open(fout, 'w') as fo:
	fo.write("".join(fdata2))

print "Layout processed {} to {}".format(fin, fout)

