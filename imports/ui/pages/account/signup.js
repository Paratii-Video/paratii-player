import { Template } from 'meteor/templating';
// import { web3 } from '/imports/lib/ethereum/web3.js';
import lightwallet from "eth-lightwallet/dist/lightwallet.js";
import HookedWeb3Provider from "hooked-web3-provider";
import users from '../../../api/users.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import {createWallet} from '../../../lib/ethereum/wallet.js'
import './signup.html';

Template.account_signup.events({
	'submit #form-create-account'(event) {
	    // Prevent default browser form submit
	    event.preventDefault();
    	FlowRouter.go('user-info');
	    const target = event.target;
	    let password = target.password.value;
	    let options = {
	    	username: target.username.value,
	    	email: target.email.value,
	    	password: password,
	    	profile: {},
	    }
	    // create a new user
	    let user = users.createUser(options)
	    // create a wallet
    	let seed = createWallet(password, 'xxx');
    	console.log('seed is important:' + seed);
    	console.log(user)
	    return
	},
});
