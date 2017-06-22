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

      // Render the video on the video tag defined in player.html
      fileToPlay.renderTo('video#video-player', { controls: false, autoplay: false }, (error) => {
        if (error) {
          templateDict.set('status', `error: ${error}`);
        } else {
          templateDict.set('status', 'video player created');
        }
      });

      // show some information to the user
      function updateStatus() {
        const numpeers = torrent.numPeers + (client.numPeers === 1 ? ' peer' : ' peers');

        // Progress
        const percent = Math.round(torrent.progress * 100 * 100) / 100;
        const barWidth = templateInstance.find('#video-progress').offsetWidth;
        templateDict.set('loadedProgress', (percent / 100) * barWidth);
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
