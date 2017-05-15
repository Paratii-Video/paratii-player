export const populateVideos = () => {
    if (Videos.find().count() === 0) {
      console.log("|"); console.log("|")
      console.log(" --> No video in database lets add some fake one!")

      const v1 = {
        id: 1,
        title: 'Nature Power - Surf Nature Power',
        thumb: '/img/thumb1-img.png',
        duration: '15:30',
        price: '22',
        stats: {
          likes_percentage: 84,
          views: 15524,
        },
      };
      const v2 = {
        id: 1,
        title: 'Longboard Northern California Jorney',
        thumb: '/img/thumb2-img.png',
        duration: '03:22',
        price: '',
        stats: {
          likes_percentage: 98,
          views: 2244245,
        },
      }
      videoList = [v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2]
        _.each(videoList, video => {
          Videos.insert(video)
        })

    }
}
