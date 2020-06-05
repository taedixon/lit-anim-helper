#!/bin/bash
rm -r dist
npx webpack --config ./webpack.config.js
cp -r node_modules/@webcomponents/webcomponentsjs dist
cp -r static dist/
cp index.html dist/
cp package.json dist/