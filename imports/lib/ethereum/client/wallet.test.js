
import { assert } from 'chai'

// import lightwallet from 'eth-lightwallet/dist/lightwallet.js';
import { createKeystore } from '../wallet.js'

describe('ethereum wallet', function () {
  this.timeout(10000)
  it('create a wallet with a random seedPhrase', function (done) {
    const password = 'mypass'
    // createKeystore returns a seed
    createKeystore(password, null, null, function (error, seed) {
      if (error) { throw error }
      assert.equal(seed.split(' ').length, 12)
      done()
    })
  })

  it('create a wallet with a given seedPhrase', function (done) {
    const password = 'mypass'
    const seedPhrase = 'fire child menu visa cupboard audit reason announce output hungry bulk vessel'
    // createKeystore returns a seed
    createKeystore(password, seedPhrase, null, function (error, seed) {
      if (error) { throw error }
      assert.equal(seed.split(' ').length, 12)
      done()
    })
  })

  // it('restore a wallet (disabled)', async function (done) {
  //   // disabled because it takes too long
  //   done();
  //   return;
  //   this.timeout(60000);
  //   const password = 'mypass';
  //   let ks1,
  //     ks2;
  //   const seedPhrase = lightwallet.keystore.generateRandomSeed();
  //   createKeystore(password, seedPhrase, null,
  //     function (ks1) {
  //       createKeystore('another-password', seedPhrase, null, function (ks2) {
  //         assert.isAtLeast(ks1.getAddresses().length, 1);
  //         assert.equal(ks1.getAddresses(), ks2.getAddresses());
  //         done();
  //       });
  //     },
  //   );
  // });
})
