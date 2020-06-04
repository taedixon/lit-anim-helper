#!/bin/bash
rm -r web
webpack --config ./webpack.web.config.js
cp -r node_modules/@webcomponents/webcomponentsjs web/
cp -r static web/
cp index.html web/