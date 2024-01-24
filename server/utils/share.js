var Twit = require('twit');
var path = require('path');
var https = require("https");
var fs = require('fs');
const { TwitterApi} = require("twitter-api-v2");
const Twitter = require('twitter-api-v2')
const { TwitterApiRateLimitPlugin } = require('@twitter-api-v2/plugin-rate-limit');
const rateLimitPlugin = new TwitterApiRateLimitPlugin();
require('dotenv').config()

const getTwitterMediaFromURL = async ({twitterClient , url}) => {
  const buffer = await getBufferFromURL(url);
  if (!buffer) {
      return;
  }

  // console.log('buffer ', buffer.toString('base64'));

  try {
      return await twitterClient.v1.uploadMedia(buffer, {mimeType: getMimeTypeFromURL(url)});
  } catch (error) {
      console.error('Could not upload media. ', error);
      return null;
  }
  
  // return await twitterClient.v1.uploadMedia(buffer, {mimeType: getMediaTypeFromURL(url)});
};


const getBufferFromURL = async (url) => {
  return await new Promise((resolve, reject) => {
      https.get(url, response => {
          const data = [];
          response.on('data', chunk => {
              data.push(chunk);
          });
          response.on('end', () => {
              resolve(Buffer.concat(data));
          });
      }).on('error', error => {
          console.error('Could not retrieve media data. ', url, error);
          reject();
      });
  });
};

const getMimeTypeFromURL = (url) => {
  url = url.toLowerCase();

  // Jpeg
  // Mp4
  // Gif
  // Png
  // Srt
  // Webp

  if (url.endsWith('mp4')) {
      return Twitter.EUploadMimeType.Mp4;
  } else if (url.endsWith('png')) {
      return Twitter.EUploadMimeType.Png;
  } else if (url.endsWith('jpg')) {
      return Twitter.EUploadMimeType.Jpeg;
  } else if (url.endsWith('jpeg')) {
      return Twitter.EUploadMimeType.Jpeg;
  } else if (url.endsWith('gif')) {
      return Twitter.EUploadMimeType.Gif;
  }

  return null;
};
const postTwitte = async({token , tokenSecret , url , caption}) => {
  
  try{
    var twitterClient = new TwitterApi({
      appKey : process.env.TWITTER_CONSUMER_KEY,
      appSecret: process.env.TWITTER_CONSUMER_SECRET,
      accessToken: token,
      accessSecret: tokenSecret,
    },{plugins:[rateLimitPlugin]});
    
    const twitterVideo = await getTwitterMediaFromURL({twitterClient , url});
    const tweet = await twitterClient.v2.tweet(caption, {
        media: {
            media_ids: [twitterVideo],
        },
    })
    const me = await twitterClient.v2.me();
    const newLink = 'https://twitter.com/@' + me.data.username + '/status/' + tweet.data.id
    return newLink;
  }catch(error){
    if (error.code === 400) {
      const detail = error?.data?.detail || error;
      console.log('Failed to post tweet.\n' + detail + '\nhttps://help.twitter.com/en/using-twitter/twitter-videos');
      console.error('Failed to tweet videos. ', detail);
    } else {
        const detail = error?.data?.detail || error;
        console.log('Failed to post tweet.\n' + detail);
        console.error('Failed to tweet videos. ', detail);
    }
  }
}
/*
function postTwitWithFile({ token, tokenSecret, video, twitText }) {
  return new Promise(function (resolve) {
    var T = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: token,
      access_token_secret: tokenSecret,
      timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
      strictSSL: false,     // optional - requires SSL certificates to be valid.
    })
    T.get('account/verify_credentials', { skip_status: true }, function (err, userData, response) {

      // console.log('authdata', userData.screen_name)
      T.postMediaChunked({ file_path: video }, function (err, data, response) {

        function checkUploadStatus(data) {
          if (!data.media_id_string) return;
          var sec = data.processing_info.check_after_secs;

          setTimeout(function () {
            T.get('media/upload', { command: 'STATUS', media_id: data.media_id_string }, function (err, data, response) {
              console.log('media',data)

              if (data.processing_info.state === 'succeeded') {
                postTwitWithVideo(data.media_id_string)
              }
              else { checkUploadStatus(data) }
            })
          }, sec * 1000)
        }

        function postTwitWithVideo(videoId) {
          T.post('statuses/update', { status: twitText, media_ids: [videoId] }, function (err, tdata, response) {
            console.log('post' , tdata)
            var newPostedLink = 'https://twitter.com/@' + userData.screen_name + '/status/' + data.media_id_string
            console.log(newPostedLink)
            resolve(newPostedLink);
          })
        }

        checkUploadStatus(data)

      })

    })
  })

}

function downloadVideoFile(url) {
  return new Promise(function (resolve) {
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
  return new Promise(function (resolve) {
    fs.unlinkSync(video);
    resolve();
    console.log('File deleted!');
  })
}
*/
//module.exports = { postTwitWithFile, downloadVideoFile, deleteFile };
module.exports = { postTwitte }