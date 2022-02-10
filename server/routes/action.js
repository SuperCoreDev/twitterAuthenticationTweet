var express = require('express');
var passport = require('passport');
var router = express.Router();
var { postTwitWithFile, deleteFile, downloadVideoFile } = require('../utils/share')

router.get('/action/post', async function(req, res, next) {
  var token = req.query.token;
  var tokenSecret = req.query.tokenSecret;
  var twitText = req.query.text;
  var videoUrl = req.query.url;
  var video = await downloadVideoFile(videoUrl);

  await postTwitWithFile({
    twitText,
    video,
    token: token,
    tokenSecret: tokenSecret
   });
  await deleteFile(video);

  return res.send('finish')
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
