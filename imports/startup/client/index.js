// Import client startup through a single index entry point

import './routes.js';

import { Meteor } from 'meteor/meteor';
// import { web3 } from '../imports/lib/ethereum/web3.js';
import '../../lib/ethereum/web3.js';
import '../../lib/ethereum/walletConnector.js';


var connect = function(){

    if(web3.isConnected()) {

        // only start app operation, when the node is not syncing (or the eth_syncing property doesn't exists)
        web3.eth.getSyncing(function(e, sync) {
            if(e || !sync) {
                connectToNode();
            } else {
                EthAccounts.init();
            }
        });

    } else {

        // make sure the modal is rendered after all routes are executed
        Meteor.setTimeout(function(){
            // if in mist, tell to start geth, otherwise start with RPC
            var gethRPC = (web3.admin) ? 'geth' : 'geth --rpc --rpccorsdomain "'+window.location.protocol + '//' + window.location.host+'"';

            EthElements.Modal.question({
                text: new Spacebars.SafeString(TAPi18n.__('wallet.app.texts.connectionError' + (web3.admin ? 'Mist' : 'Browser'), 
                    {node: gethRPC})),
                ok: function(){
                    Tracker.afterFlush(function(){
                        connect();
                    });
                }
            }, {
                closeable: false
            });

        }, 600);
    }
}
Meteor.startup(function(){
    // delay so we make sure the data is already loaded from the indexedDB
    // TODO improve persistent-minimongo2 ?
    Meteor.setTimeout(function() {
        connect();
    }, 1000);
});
