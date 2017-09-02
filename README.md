[![CircleCI](https://circleci.com/gh/Paratii-Video/paratii-player.svg?style=svg)](https://circleci.com/gh/Paratii-Video/paratii-player)

# Paratii Player

This is the repository for developing the Paratii Media Player.

More information can be found on [paratii.video](http://paratii.video/), or in our [blueprint](https://github.com/Paratii-Video/paratii-player/wiki/Paratii-Blueprint). Join the discussion on [gitter](https://gitter.im/Paratii-Video).


# Installation


Install node (https://nodejs.org/en/download/) and npm (these are the instructions for a debian based system - please check the download page for instructions for your OS):

    sudo apt-get install -y build-essential
    curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo pm install npm@latest -g

Install meteor (https://www.meteor.com/install):

    curl https://install.meteor.com/ | sh

Clone this paratii-player repository, either with https or ssh:


    git clone https://github.com/Paratii-Video/paratii-player.git

    git clone git@github.com:Paratii-Video/paratii-player.git

Install the package:

    cd paratii-player
    npm install

Now, start the application:

    npm start


# Testing

The application has two kinds of tests:

    npm test

End-to-end tests that can be run by starting up the application in one window:

    meteor --settings settings-dev.json

And running the tests in another window:

    npm run chimp-test

Or, when you are developing:

    npm run chimp-watch


# Contributing

Most of the code is fresh and undocumented. Contributions are welcome - just be on the lokkout for the 🐲s. [Here](https://github.com/Paratii-Video/wiki/blob/master/CONTRIBUTING.md) you can find some guidelines and the kind of help we would be interested in.

Make sure all tests pass:

Testing

    npm test
    npm run

Run lint:

    npm run lint

Pull requests are welcome.

[preach here about testing]


# Building the application

    meteor build

if you get out-of-memory errors, setting TOOL_NODE_FLAGS may help:

    export TOOL_NODE_FLAGS="--max_old_space_size=4096"
