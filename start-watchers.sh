#!/bin/bash

# Start Sass css watchers
sass --watch scss:pub/css &

for iname in `find . -name 'ES*' -type d`; do
	echo "Sass watching $iname"
	sass --load-path=scss --watch $iname:pub/css &
done;

# Start html layout watchers
for iname in `find ./ES* -name '*.html'`; do
	oname=`echo $iname | sed -e 's+ES.*/+pub/+'`
	echo "Layout watching $iname to $oname"
	echo $iname | entr ./Layout/impress-positioner.py $iname $oname &
done;

