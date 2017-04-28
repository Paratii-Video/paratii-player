/**
Check if a pending confirmation is still pending

@method checkConfirmation
*/
checkConfirmation = function (confirmationId) {
  const conf = PendingConfirmations.findOne(confirmationId);
  if (!conf) return;

  const wallet = Helpers.getAccountByAddress(conf.from);

  if (conf.operation && wallet && wallet.requiredSignatures > conf.confirmedOwners.length) {
    let removed = false;
    const contract = contracts[`ct_${wallet._id}`];

    setTimeout(function () {
      _.each(wallet.owners, function (owner) {
        contract.hasConfirmed(conf.operation, owner, function (e, res) {
          if (!removed && !e) {
            if (res) {
              PendingConfirmations.update(confirmationId, { $addToSet: { confirmedOwners: owner } });
            } else {
              PendingConfirmations.update(confirmationId, { $pull: { confirmedOwners: owner } });
            }

            const pendingConf = PendingConfirmations.findOne(confirmationId);

            if (pendingConf && (!pendingConf.confirmedOwners.length || Number(wallet.requiredSignatures) === pendingConf.confirmedOwners.length)) {
              PendingConfirmations.remove(confirmationId);
              removed = true;
            }
          }
        });
      });
    }, 1000);
  }
};

/**
Observe pending confirmations

@method observePendingConfirmations
*/
observePendingConfirmations = function () {
    /**
    Observe PendingConfirmations

    @class PendingConfirmations({}).observe
    @constructor
    */
  collectionObservers[collectionObservers.length] = PendingConfirmations.find({}).observe({
        /**
        Add pending confirmations to the accounts

        @method added
        */
    added(document) {
      checkConfirmation(document._id);

      if (typeof mist !== 'undefined' && document.confirmedOwners && document.confirmedOwners.length) {
        mist.menu.setBadge(TAPi18n.__('wallet.app.texts.pendingConfirmationsBadge'));
      }
    },
        /**
        Remove pending confirmations from the accounts

        @method removed
        */
    removed(document) {
      updateMistBadge();
    },
        /**
        Add pending confirmations to the accounts

        @method changed
        */
    changed(id, fields) {
      if (typeof mist !== 'undefined' && document.confirmedOwners && document.confirmedOwners.length) {
        mist.menu.setBadge(TAPi18n.__('wallet.app.texts.pendingConfirmationsBadge'));
      }
    },
  });
};
