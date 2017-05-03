#!/bin/bash
export TOOL_NODE_FLAGS="--max-old-space-size=4096" 

# meteor build .

rsync -az paratii-player.tar.gz paratii@paratii.gerbrandy.com:/home/paratii/
ssh paratii@paratii.gerbrandy.com <<'ENDSSH'
#commands to run on remote host

tar xf paratii-player.tar.gz

cd bundle/programs/server && sudo npm install
export PWD=/home/paratii
export HOME=/home/paratii
# leave as 127.0.0.1 for security
export BIND_IP=127.0.0.1
# the port 
export PORT=3000
# this allows Meteor to figure out correct IP address of visitors
export HTTP_FORWARDED_COUNT=1
# MongoDB connection string using todos as database name
export MONGO_URL=mongodb://localhost:27017/paratii-player
# The domain name as configured previously as server_name in nginx
export ROOT_URL=https://paratii.gerbrandy.com

# optional JSON config - the contents of file specified by passing "--settings" parameter to meteor command in development mode
# export METEOR_SETTINGS='{ "somesetting": "someval", "public": { "othersetting": "anothervalue" } }'

# this is optional: http://docs.meteor.com/#email
# commented out will default to no email being sent
# you must register with MailGun to have a username and password there
# export MAIL_URL=smtp://postmaster@mymetorapp.net:password123@smtp.mailgun.org
# alternatively install "apt-get install default-mta" and uncomment:
# export MAIL_URL=smtp://localhost


# a bit rigorous but we have a dedicated machine
forever stopall
cd 
forever start bundle/main.js
ENDSSH


