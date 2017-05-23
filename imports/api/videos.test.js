import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';

import { Videos } from './videos.js';

function likeVideo(videoId, userId) {
  const method = Meteor.server.method_handlers['videos.like'];
  // Set up a fake method invocation that looks like what the method expects
  const invocation = { userId };
  // Run the method with `this` set to the fake invocation
  method.apply(invocation, [videoId]);
}

if (Meteor.isServer) {
  describe('Videos', () => {
    describe('methods', () => {
      let userId;
      let videoId;

      beforeEach(() => {
        Videos.remove();
        videoId = Videos.insert({
          title: 'title-of-video',
          price: 1234,
          stats: {
            likes: 3141,
            dislikes: 2718,
          },
        });
        userId = Meteor.users.insert({
          name: 'Rosencrantz',
        });
      });

      it('vidoes.like works as expected', () => {
        assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3141);

        // the first like shoudl increment the likes counter with 1
        likeVideo(videoId, userId);
        assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3142);

        // if our user likes the same video again, it will have no effect
      });
    });
  });
}
