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

x_pos = {}
y_pos = {}

def parse_pos_x(term, rel=False, id=None):
	global xloc, xmin, xmax

	p = term.split(':')
	if len(p) == 1:
		n = int(p[0])
	elif len(p) == 2:
		if p[0] not in x_pos:
			print "No step {} for relative position".format(p[0])
			exit(-1)

		n = x_pos[p[0]] + int(p[1])
	else:
		print "Invalid position specifier {}".format(term)
		exit(-1)

	if rel:
		n += xloc

	if id is not None:
		x_pos[id] = n

	xloc = n

	xmin = min(xmin, xloc)
	xmax = max(xmax, xloc)


def parse_pos_y(term, rel=False, id=None):
	global yloc, ymin, ymax

	p = term.split(':')
	if len(p) == 1:
		n = int(p[0])
	elif len(p) == 2:
		if p[0] not in y_pos:
			print "No step {} for relative position".format(p[0])
			exit(-1)

		n = y_pos[p[0]] + int(p[1])
	else:
		print "Invalid position specifier {}".format(term)
		exit(-1)

	if rel:
		n += yloc

	if id is not None:
		y_pos[id] = n

	yloc = n

	ymin = min(ymin, yloc)
	ymax = max(ymax, yloc)

def process1(l):

	need_rewrite = False

	idm = re.search('id=.([a-zA-Z\-0-9]*).', l)
	if idm is not None:
		id = idm.group(1)
		print id
	else:
		id = None

	# Track current X position
	xm = re.search('data-x=.([\-0-9]*).',l)
	if xm is not None:
		parse_pos_x(xm.group(1), False, id)

	xm = re.search('data-x-rel=.([a-zA-Z:\-0-9]*).',l)
	if xm is not None:
		parse_pos_x(xm.group(1), True, id)
		need_rewrite = True

	# Track current Y position
	xm = re.search('data-y=.([\-0-9]*).',l)
	if xm is not None:
		parse_pos_x(xm.group(1), False, id)

	xm = re.search('data-y-rel=.([a-zA-Z:\-0-9]*).',l)
	if xm is not None:
		parse_pos_x(xm.group(1), True, id)
		need_rewrite = True

	# Rewrite pos
	if need_rewrite:
		xstr = "data-x='{}'".format(xloc)
		ystr = "data-y='{}'".format(yloc)
		print xstr
		l = re.sub('data-x-rel=.([a-zA-Z:\-0-9]*).', xstr, l)
		l = re.sub('data-y-rel=.([a-zA-Z:\-0-9]*).', ystr, l)

	return l

def process2(l):
	r = re.search('<div id=[\'"](over[a-zA-Z]*)[\'"] .*/>', l)
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

