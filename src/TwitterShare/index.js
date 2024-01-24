import Axios from 'axios';
import React, { useState } from 'react';

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

const TwitterShare = () => {
  const [ twitter, setTwitter ] = useState(null);
  const [ postStatus, setPostStatus ] = useState('please login first.');
  const [ text, setText ] = useState('Twee text here...');
  const [ videoUrl, setVideoUrl ] = useState('https://video.twimg.com/ext_tw_video/1483426943181668354/pu/vid/640x360/hA1l1K8uaxIzjmUb.mp4');

  function handleClickLoginButton() {
    const href = `/login/federated/twitter.com`;
    const win = window.open(href, 'mywin', 'left=20,top=20,width=500,height=500,toolbar=1,resizable=0');

    const timer = setInterval(() => {
      const token = getCookie('twitter-token');
      if (token) {
        const tokenData = JSON.parse(decodeURIComponent(token));
        win.close();
        setPostStatus('login successed.')
        clearInterval(timer);
        setTwitter(tokenData);
      }
    }, 1000)

  }

  function handleShareToTwitter() {
    const { token, tokenSecret } = twitter;

    setPostStatus('Tweeting...');
    Axios.get(`/action/post?token=${token}&tokenSecret=${tokenSecret}&text=${text}&url=${videoUrl}`)
    .then(res => {
      if (res.data.status === 'finish') {
        setPostStatus('Check your tw on x.');
        console.log(res.data.link)
        window.open(res.data.link , '_blank')
      }
    })
    
  }
  
  return (
    <div>
      <p>{ postStatus }</p>
      {
        twitter &&
        <div>
          <p style={{ fontSize: '12px' }}>token: {twitter.token}</p>
          <div>text: <input type="text" onChange={e => setText(e.currentTarget.value)} value={text} /></div>
          <div>video: <input type="text" onChange={e => setVideoUrl(e.currentTarget.value)} value={videoUrl} /></div>
        </div>
      }
      { twitter ? 
        <button onClick={handleShareToTwitter}>Share to tw</button> :
        <button onClick={handleClickLoginButton}>Login to share tw</button>
      }
    </div>
  )
}

export default TwitterShare;