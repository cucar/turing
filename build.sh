#!/usr/bin/bash

# jenkins runs this in an interactive shell, which is different from when we normally ssh in
# because of this, jenkins does not properly source the .bashrc file, which instantiates nvm
. ~/.bashrc

# package and release the server first (koa)
cd "$WORKSPACE/server"
npm install -g pm2 # install pm2 if not already done before
npm install # download node libraries
rm -rf test .eslintrc .gitignore nodemon.json # delete development specific files
rm -rf ~/api/* # delete existing server code
cp -r $WORKSPACE/server ~/api # copy the server code
cd ~/api # switch folder to the server directory
pm2 reload server # reload and restart the server - to start a new app, we do pm2 start server.js -i 1

# package and release the client side (react)
cd "$WORKSPACE/client"
npm install # download node libraries
npm run build # build react app, package it and place it under build folder
rm -rf cd /var/www/turing.cagdasucar.com/html/* # delete existing client app code
cp -r $WORKSPACE/client/build/* /var/www/turing.cagdasucar.com/html/ # copy packaged client app code to the nginx folder