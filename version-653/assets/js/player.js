(function () {
  var video = document.getElementById('moviePlayer');
  var button = document.getElementById('playButton');
  var streamUrl = typeof playerStreamUrl === 'string' ? playerStreamUrl : '';
  var prepared = false;

  function preparePlayer() {
    if (!video || !streamUrl || prepared) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      prepared = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      prepared = true;
      return;
    }

    video.src = streamUrl;
    prepared = true;
  }

  function startPlayer() {
    preparePlayer();

    if (button) {
      button.classList.add('hidden');
    }

    if (video) {
      video.controls = true;
      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          video.focus();
        });
      }
    }
  }

  if (button) {
    button.addEventListener('click', startPlayer);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayer();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('hidden');
      }
    });

    preparePlayer();
  }
}());
