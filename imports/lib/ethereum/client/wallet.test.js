import { assert } from 'chai';

import { createWallet, getUserAddress } from '../wallet.js';
import lightwallet from 'eth-lightwallet/dist/lightwallet.js';

describe('ethereum wallet', function () {
  it('create a wallet', function (done) {
    const password = 'mypass';
    const wallet = createWallet(password);
    // createWallet returns a seed
    assert.equal(wallet.seed.split(' ').length, 12);
    done();
  });

  // it('restore a wallet (disabled)', async function (done) {
  //   // disabled because it takes too long
  //   done();
  //   return;
  //   this.timeout(60000);
  //   const password = 'mypass';
  //   let ks1,
  //     ks2;
  //   const seedPhrase = lightwallet.keystore.generateRandomSeed();
  //   createWallet(password, seedPhrase,
  //     function (ks1) {
  //       createWallet('another-password', seedPhrase, function (ks2) {
  //         assert.isAtLeast(ks1.getAddresses().length, 1);
  //         assert.equal(ks1.getAddresses(), ks2.getAddresses());
  //         done();
  //       });
  //     },
  //   );
  // });
});
