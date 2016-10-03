#!/bin/bash
cp -RT bootstrap-variables.less node_modules/bootstrap/less/variables.less
cd node_modules/bootstrap/
node_modules/grunt-cli/bin/grunt dist
cp -RT dist ../../bootstrap/
