var Twit = require('twit');
var path = require('path');
var https = require("https");
var fs = require('fs');

function postTwitWithFile({token, tokenSecret, video, twitText}) {
  return new Promise(function(resolve) {
    var T = new Twit({
      consumer_key:         process.env['TWITTER_CONSUMER_KEY'],
      consumer_secret:      process.env['TWITTER_CONSUMER_SECRET'],
      access_token:         token,
      access_token_secret:  tokenSecret,
      timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
      strictSSL:            false,     // optional - requires SSL certificates to be valid.
    })

    T.postMediaChunked({ file_path: video }, function (err, data, response) {

      function checkUploadStatus(data) {
        if (!data.media_id_string) return;
        var sec = data.processing_info.check_after_secs;

        setTimeout(function() {
          T.get('media/upload', { command: 'STATUS', media_id: data.media_id_string },  function (err, data, response) {
            console.log(data)

            if (data.processing_info.state === 'succeeded') {
              postTwitWithVideo(data.media_id_string)
            }
            else { checkUploadStatus(data) }
          })
        }, sec * 1000)
      }

      function postTwitWithVideo(videoId) {
        T.post('statuses/update', { status: twitText, media_ids: [videoId] }, function(err, data, response) {
          resolve();
        })
      }

      checkUploadStatus(data)
    })
  })

}

function downloadVideoFile(url) {
  return new Promise(function(resolve) {
    https.get(url, (res) => {
      var filePath = '../public/' + url.split("id=")[1] + ".mp4";
      var video = path.join(__dirname, filePath);
      var writeStream = fs.createWriteStream(video);

      res.pipe(writeStream);

      writeStream.on('finish', () => {
        console.log('download finish...')
        writeStream.close();
        resolve(video);
      })
    })
  })
}

function deleteFile(video) {
  return new Promise(function(resolve) {
    fs.unlinkSync(video);
    resolve();
    console.log('File deleted!');
  })
}

module.exports = { postTwitWithFile, downloadVideoFile, deleteFile };