
/* eslint-env mocha */

import { createWallet } from '../wallet.js'

describe('ethereum wallet', function () {
  it('create a wallet', function() {
    let extraEntropy = '12345';
    console.log('(enter entropy): ' + extraEntropy);
    let password = 'mypass'
    console.log('(enter password): ' + password);
    let seed = createWallet(password, extraEntropy);
    console.log('seed is:'  + seed);
  });
});