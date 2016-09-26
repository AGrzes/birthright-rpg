#!/bin/bash
cd node_modules/bootstrap/
node_modules/grunt-cli/bin/grunt dist
cp -R dist ../../bootstrap
