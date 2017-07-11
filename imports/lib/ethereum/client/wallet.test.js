import { assert } from 'chai';

// import lightwallet from 'eth-lightwallet/dist/lightwallet.js';
import { createKeystore } from '../wallet.js';

describe('ethereum wallet', function () {
  it('create a wallet', function (done) {
    const password = 'mypass';
    const keystore = createKeystore(password);
    // createKeystore returns a seed
    assert.equal(keystore.seed.split(' ').length, 12);
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
  //   createKeystore(password, seedPhrase,
  //     function (ks1) {
  //       createKeystore('another-password', seedPhrase, function (ks2) {
  //         assert.isAtLeast(ks1.getAddresses().length, 1);
  //         assert.equal(ks1.getAddresses(), ks2.getAddresses());
  //         done();
  //       });
  //     },
  //   );
  // });
});
