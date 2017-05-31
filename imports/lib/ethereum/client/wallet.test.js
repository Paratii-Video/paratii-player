import { assert } from 'chai';

import { createWallet, getUserAddress } from '../wallet.js'
// import lightwallet from "eth-lightwallet/dist/lightwallet.js";

describe('ethereum wallet', function() {
  it('create a wallet', function(done) {
    let password = 'mypass'
    let wallet = createWallet(password);
    // createWallet returns a seed
    assert.equal(wallet.seed.split(' ').length, 12);
    done();
  });

  // it('get User address', async function(done) {
  // 	let password = 'a password'
  // 	createWallet(password);
  // 	let address = getUserAddress();
  // 	// assert.equal(keystore.getAddresses().length, 1);
  // 	done();
  // })

});