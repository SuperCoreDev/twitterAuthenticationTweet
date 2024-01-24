var express = require('express');
var passport = require('passport');
var router = express.Router();
// var { postTwitWithFile, deleteFile, downloadVideoFile } = require('../utils/share')
var {postTwitte} = require('../utils/share')
router.get('/action/post', async function(req, res, next) {
  var token = req.query.token;
  var tokenSecret = req.query.tokenSecret;
  var caption = req.query.text;
  var url = req.query.url;
  var link = await postTwitte({token, tokenSecret, url , caption})
  // var video = await downloadVideoFile(videoUrl);
  // var link = await postTwitWithFile({
  //   twitText,
  //   video,
  //   token: token,
  //   tokenSecret: tokenSecret
  //  })
  // await deleteFile(video);
  //  console.log('receivedlink',link)
  
  return res.send({status:'finish' , link})
});

router.get('/action/finish', function(req, res, next) {
  res.render('finish');
});

router.get('/failed', function(req, res, next) {
  res.render('failed');
});

router.get('/login/federated/twitter.com', passport.authenticate('twitter'));

router.get('/oauth/callback/twitter.com',
  passport.authenticate('twitter', { assignProperty: 'federatedUser', failureRedirect: '/failed' }),
  async function(req, res, next) {
    res.cookie('twitter-token', JSON.stringify({
      token: req.federatedUser.token,
      tokenSecret: req.federatedUser.tokenSecret
    }));
    res.render('finish');
  
  }
);

module.exports = router;
