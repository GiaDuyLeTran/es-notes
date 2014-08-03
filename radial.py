#!/usr/bin/env python

import sys
from math import *

if len(sys.argv) != 5:
    exit()

x = int(sys.argv[1])
y = int(sys.argv[2])
step = int(sys.argv[3])
rad = int(sys.argv[4])

sep = radians(30)

for i in range(step):
    a = (i - step / 2) * sep
    print int(x + rad * cos(a)), int(y + rad * sin(a))

