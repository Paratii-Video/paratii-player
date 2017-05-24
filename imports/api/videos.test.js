import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';

import { Videos, userLikesVideo, userDislikesVideo } from './videos.js';

function likeVideo(videoId, userId) {
  const method = Meteor.server.method_handlers['videos.like'];
  // Set up a fake method invocation that looks like what the method expects
  const invocation = { userId };
  // Run the method with `this` set to the fake invocation
  method.apply(invocation, [videoId]);
}

function dislikeVideo(videoId, userId) {
  const method = Meteor.server.method_handlers['videos.dislike'];
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
        Meteor.users.remove();
        userId = Meteor.users.insert({
          name: 'Rosencrantz',
        });
      });

      it('userLikesVideo returns correct value', () => {
        assert.equal(userLikesVideo(userId, videoId), false);
        likeVideo(videoId, userId);
        assert.equal(userLikesVideo(userId, videoId), true);
      });

      it('userDislikesVideo returns correct value', () => {
        assert.equal(userDislikesVideo(userId, videoId), false);
        dislikeVideo(videoId, userId);
        assert.equal(userDislikesVideo(userId, videoId), true);
      });

      it('videos.like works as expected', () => {
        assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3141);

        // the first like shoudl increment the likes counter with 1
        likeVideo(videoId, userId);
        assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3142);
        // the like is also registered with the user
        assert.deepEqual(Meteor.users.findOne({ _id: userId }).stats.likes, [videoId]);

        // if our user likes the same video again, it will have no effect
        likeVideo(videoId, userId);
        assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3142);
        assert.equal(Videos.findOne({ _id: videoId }).stats.dislikes, 2718);


        // if the user dislikes the video, the likes counter will be down
        dislikeVideo(videoId, userId);
        assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3141);
        assert.equal(Videos.findOne({ _id: videoId }).stats.dislikes, 2719);

        // dislikes again and nothing will change, the likes counter will be down
        dislikeVideo(videoId, userId);
        assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3141);
        assert.equal(Videos.findOne({ _id: videoId }).stats.dislikes, 2719);
      });
    });
  });
}