var client_id = 'c06ca7d6395a410884815f9c38596f4c';
var redirect_uri = 'http://localhost:3000/callback';
var client_secret = '246e22c8b35943b3b020827dd81a10b1';
// var youtube_key = "AIzaSyDc0ns2SIiQHRNFnXkg4-0PlJwfDtsBAJQ"
var youtube_key = "AIzaSyCdA62S5HP5pukh0RsA4SvNg2R9qlO9pWs"
var obj = {  access_token: 'BQDAbLX5uAxd-nwYtkLV0ExDwl3XPfq9Kgu7nkF7HZqKHNpCnJa6Q5euUZVKKkbrsYvfCDwQVpspFz_8Y4lzBHpoPvW02qc6Y65YOEyboMb1Yv9CkxklWa5CzYis8SV5ghDbAuZi8jrcIJnAkzhEZZ4yWylLLhJOtxyJinF0R8MgBddqjO3SjX4PGxBE9HGZcB9Dj7bvnEVT2K9VaQTO9tRbYA4teA',
token_type: 'Bearer',
expires_in: 3600,
refresh_token: 'AQD4vk753jlWAUz24YXA2P1ZyFIPiLWJ0kjkC2Jtf0O9xME_NiZIQUc2X1r6Roo7ZP8mJHGHsXmut4XD4VzVPaOsJXegF0Psb6hCpuPGi2lPRhMxkO7GroqKhez2WGQlWUE',
scope: 'playlist-read-private user-read-private'
}

import fetch from 'node-fetch';
import express from 'express'
import querystring from 'querystring'
import ytdl from 'ytdl-core'; 
import fs from 'fs'
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { spawn } from 'child_process';
import cors from 'cors'

ffmpeg.setFfmpegPath(ffmpegPath);
var app = express();
app.use(cors())

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

app.get("/",function(req,res){
    res.send("hi")
})

app.get('/login', function(req, res) {

  var state = makeid(16);
  var scope = 'user-read-private playlist-read-private';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

//https://my-domain.com/callback?code=NApCCg..BkWtQ&state=34fFs29kd09

app.get('/callback', async function(req, res) {

    var code = req.query.code || null;
    var state = req.query.state || null;
  
    if (state === null) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: true
      };
      const response = await fetch(authOptions.url, {method: 'POST', body: querystring.stringify(authOptions.form),headers:authOptions.headers});
      const data = await response.json();
      console.log(data);
    }
  });


  app.get('/playlists/:id/:token/:offset',async (req,res)=>{
    const id = req.params.id
    const token = req.params.token
    const offset = req.params.offset
    console.log(token)
    const data = await getPlaylistData(id,token,offset)
    res.send(data)
  })

  app.get('/videos/:title',async (req,res)=>{
    const title = req.params.title
    console.log("title is",title)
    const data  = await getVideoInfo(title)
    res.send(data)
  })

  app.get('/video/:id/:name',(req,res)=>{
    const id = req.params.id
    const name = req.params.name
    downloadVideo(id,`https://www.youtube.com/watch?v=${id}`,res,name)
  })


  app.listen(3000,()=>{
      console.log("started server")
  })



 async function getPlaylistData(id,token,offset){
      const url = `https://api.spotify.com/v1/playlists/${id}/tracks?fields=%28next%2Cprevious%2Citems%28track%28name%2Calbum%28images%29%2Cartists%28name%29%29%29%29&limit=5&offset=${offset}`
      const header = `Bearer ${token}`
      try{
        const response = await fetch(url, {method: 'GET',headers:{
          "Authorization":header
      }});
      const data = await response.json();
      console.log(data)
      const tracks = data.items.map(track => {
        const obj = {}
        track = track.track
        obj.image = track.album.images[0].url
        obj.artist = track.artists[0].name
        obj.songName = track.name 
        return obj
      })
      return {
          tracks,
          next:data.next,
          prev:data.previous
      }
      }
      catch(e){
        console.log(e)
      }


  }

  async function getVideoInfo(videoTitle){
    try{
      const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${videoTitle}&key=${youtube_key}`
      const response = await fetch(url);
     const data = await response.json();
     console.log(data)
     const item = data.items[0]
     const vidId = item.id.videoId
     const title = item.snippet.title
     const channel = item.snippet.channelTitle
     console.log(item)
     const img = item.snippet.thumbnails.high.url
     const vidurl = `https://www.youtube.com/watch?v=${vidId}`
     return {
         vidId,title,channel,img,vidurl
     }
    }
    catch(e){
      console.log(e)
    }

  }

async function downloadVideo(id,link,res,name){
  try{
    let info = await ytdl.getInfo(id);
    //receive a readable stream from ytdl    
    let stream = ytdl.downloadFromInfo(info,{filter:"audioonly",quality:"highestaudio"})

    const ffmpegCommand = spawn(ffmpegPath, [
      '-i', 'pipe:0', // Input from stdin (pipe:0)
      '-vn',         // Only process the audio stream
      '-c:a', 'libmp3lame', // Set the MP3 audio codec
      "-f", "mp3",
      '-progress', 'pipe:1',
       "-"              // Output on stdout
    ]);
      
      stream.pipe(ffmpegCommand.stdin);

      res.set('Content-disposition', 'attachment; filename=' + encodeURI(`${name}.mp3`));
      //res.set('Content-disposition', 'attachment; filename=' + encodeURI(`songg.mp3`));
      res.set('Content-Type', 'audio/mp3');

      
      ffmpegCommand.stderr.on('data', (data) => {
        console.error('Error:', data.toString());
      });
      
      ffmpegCommand.on('close', (code) => {
        if (code === 0) {
          console.log('Conversion complete.');
          //ffmpegCommand.stdout.pipe(res) //there will be no pipe Error: Output #0, mp3, to 'pipe:':
        } else {
          console.error('ffmpeg process exited with code:', code);
        }
      });

      ffmpegCommand.stdout.pipe(res)
  }
  catch(e){
    console.log(e)
  }


}

