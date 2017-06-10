import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';

import { Videos, userLikesVideo, userDislikesVideo } from './videos.js';

function likeVideo(videoId) {
  Meteor.call('videos.like', videoId);
}

function dislikeVideo(videoId) {
  Meteor.call('videos.dislike', videoId);
}

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
      const user = {
        name: 'Rosencrantz',
        stats: {
          likes: [],
          dislikes: [],
        },
      };
      userId = Meteor.users.insert(user);
      Meteor.userId = function () {
        return userId;
      };
      Meteor.user = function () {
        return Meteor.users.findOne({ _id: userId });
      };
    });

    it('userLikesVideo returns correct value', () => {
      assert.equal(userLikesVideo(userId, videoId), false);
      likeVideo(videoId);
      assert.equal(userLikesVideo(userId, videoId), true);
    });

    it('userDislikesVideo returns correct value', () => {
      assert.equal(userDislikesVideo(userId, videoId), false);
      dislikeVideo(videoId);
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
      likeVideo(videoId);
      assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3142);
      assert.equal(Videos.findOne({ _id: videoId }).stats.dislikes, 2718);


      // if the user dislikes the video, the likes counter will be down
      dislikeVideo(videoId);
      assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3141);
      assert.equal(Videos.findOne({ _id: videoId }).stats.dislikes, 2719);

      // dislikes again and nothing will change, the likes counter will be down
      dislikeVideo(videoId);
      assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3141);
      assert.equal(Videos.findOne({ _id: videoId }).stats.dislikes, 2719);
    });
  });
});
