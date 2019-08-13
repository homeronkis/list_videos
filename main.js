const videoObjects = {};

function validateId(id) {
  return id.match(/[A-Za-z0-9\-]{11}/) !== null;
}

function createItem(id, data) {
  const div = document.createElement('div');

  div.innerHTML = `
    <div class="item" data-id="${id}">
        <img class="video_image" src="${data.thumbnail_url}" alt="${data.title}" />
        <p class="video_title"><span>${data.title}</span></p>
        <div id="video-${id}"></div>
    </div>
  `.trim();

  return div.firstChild;
}

function createYoutubeFrame(id, element) {
  videoObjects[id] = new YT.Player(`video-${id}`, {
    playerVars: {'autoplay': 1},
    height: '270',
    width: '480',
    videoId: id,
    events: {
      onReady: function () {
        element.classList.add('show-video');
      }
    }
  });
}

function pauseActive() {
  try {
    const active = document.getElementsByClassName('item active')[0];
    if (videoObjects.hasOwnProperty(active.dataset.id)) {
      videoObjects[active.dataset.id].pauseVideo()
    }

    active.classList.remove('active', 'show-video');
  } catch {
  }
}

function onClick() {
  if (this.classList.contains('active')) {
    return null;
  }

  pauseActive();

  const {id} = this.dataset;

  if (videoObjects.hasOwnProperty(id)) {
    const self = this;
    setTimeout(function() {
      self.classList.add('show-video');
      videoObjects[id].playVideo();
    }, 400);
  } else {
    createYoutubeFrame(id, this)
  }

  this.classList.add('active');
}

function createVideo() {
  const searchParams = new URLSearchParams(window.location.search);
  const idList = searchParams.get('id');
  if (!idList) {
    return null
  }
  const container = document.getElementById('video-list');

  idList.split(',').forEach(function (item) {
    if (validateId(item)) {
      getVideoData(item, function (err, data) {
        if (err !== null) {
          console.log(`[GET_VIDEO] data is null: ${item}`)
        } else if (data.hasOwnProperty('error')) {
          console.log(`[GET_VIDEO] ${data.error}: ${item}`)
        } else {
          const element = createItem(item, data);
          element.addEventListener('click', onClick);
          container.appendChild(element);
        }
      });
    }
  });
}

const getVideoData = function (id, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`, true);
  xhr.responseType = 'json';
  xhr.onload = function () {
    let status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();

  return xhr.status === 200 ? JSON.parse(xhr.responseText).title : 'Error getting header'
};
document.addEventListener('DOMContentLoaded', function () {
  createVideo()
});
