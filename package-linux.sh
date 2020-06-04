#!/bin/bash

DIR='lit-animator-linux-x64'
electron-packager ./dist lit-animator --overwrite
sudo chown root $DIR/chrome-sandbox
sudo chmod 4755 $DIR/chrome-sandbox