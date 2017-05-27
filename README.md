[![CircleCI](https://circleci.com/gh/Paratii-Video/paratii-player.svg?style=svg)](https://circleci.com/gh/Paratii-Video/paratii-player)


# Installation 


Install node (https://nodejs.org/en/download/) and npma. (These are the instructions for a debian based system - please check the download page for instructions for your OS)

    sudo apt-get install -y build-essential
    curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo pm install npm@latest -g

Install meteor (https://www.meteor.com/install)

    curl https://install.meteor.com/ | sh

Clone this paratii-player repository, either with https or ssh:


    git clone https://github.com/Paratii-Video/paratii-player.git

    git clone git@github.com:Paratii-Video/paratii-player.git

Or anonymou
Install the package

    cd paratii-player
    npm install

Now start the application

    npm start


# Testing

The application has to kind of tests. 

    meteor test

And end-to-end tetst that can be run by starting up the application in one window:

    meteor run

And running the tests in another window

    meteor run chimp-test

# Contributing

Make sure all tests pass:

Testing

    npm test
    npm run 

Run lint:

    npm run lint

Pull requests are welcome.

[preach here about testing]
