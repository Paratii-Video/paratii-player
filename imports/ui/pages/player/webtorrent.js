import prettyBytes from 'pretty-bytes';


export function createWebtorrentPlayer(templateInstance, currentVideo) {
  const templateDict = templateInstance.templateDict;


  // must do $.getScript instead of just packaging webtorrent with meteor
  // because meteors package.json is @#$@#$% broken
  // cf. https://github.com/meteor/meteor/issues/7067

  templateDict.set('status', 'loading webtorrent...');
  $.getScript('https://cdn.jsdelivr.net/webtorrent/latest/webtorrent.min.js', function () {
    const client = new WebTorrent();
    // Sintel, a free, Creative Commons movie
    const magnetUri = currentVideo.src;
    templateDict.set('status', 'creating torrent...');
    client.add(magnetUri, function (torrent) {
      // Got torrent metadata!
      // console.log('Torrent info hash:', torrent.infoHash)
      // find an .mp4 file in the torrent
      const fileToPlay = torrent.files.find(function (file) {
        return file.name.endsWith('.mp4');
      });

      // a bit hackishly removing the old element and adding the new one;
      // TODO: there should be better ways of doing this (see below)

      $('#video-player').remove();
      templateDict.set('status', 'creating video player..');
      fileToPlay.appendTo('#player-container', { controls: false, autoplay: true }, function (error, element) {
        templateDict.set('status', 'video player created');
        element.setAttribute('id', 'video-player');
      });

      // next lines do not have desired effect; why??
      // var url = fileToPlay.getBlobURL() // returns null
      // console.log('setting url of player to ' + url);
      // $('#video-player').attr('src', url);

      // while this does not work either:
      // Stream the video into the video tag
      // let video = $('video')
      // fileToPlay.createReadStream().pipe(video)


      // show some information to the user
      function updateStatus() {
        const numpeers = torrent.numPeers + (client.numPeers === 1 ? ' peer' : ' peers');

        // Progress
        const percent = Math.round(torrent.progress * 100 * 100) / 100;
        // $progressBar.style.width = percent + '%'
        // $downloaded.innerHTML = prettyBytes(client.downloaded)
        // $total.innerHTML = prettyBytes(client.length)

        // Remaining time
        let remaining;
        if (torrent.done) {
          remaining = 'Done.';
        } else {
          remaining = Math.round(torrent.timeRemaining / 10) / 100;
          remaining = `${remaining} seconds remaining`;
        }

        // Speed rates
        const downloadSpeed = `${prettyBytes(client.downloadSpeed)}/s`;
        const uploadSpeed = `${prettyBytes(client.uploadSpeed)}/s`;
        const downloaded = prettyBytes(torrent.downloaded);
        const uploaded = prettyBytes(torrent.uploaded);
        templateDict.set('status', `${numpeers}; ${percent} percent; ${remaining}; download: ${downloaded} - ${downloadSpeed}; upload: ${uploaded}: ${uploadSpeed};`);
      }
      setInterval(updateStatus, 500);
    });
  });
}
