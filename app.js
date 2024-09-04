

import fetch from 'node-fetch';
import express from 'express'
// import ytdl from 'ytdl-core'; 
import ytdl from '@distube/ytdl-core'
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { spawn } from 'child_process';
import cors from 'cors'
import YTMusic from "ytmusic-api"
import 'dotenv/config'



ffmpeg.setFfmpegPath(ffmpegPath);
var app = express();
app.use(cors())
const ytmusic = new YTMusic()
await ytmusic.initialize(/* Optional: Custom cookies */)

async function getMusicVideo(title){
const songs = await ytmusic.search(title)
	let song = songs[0]
  let id = song['videoId']
  let artist = song['artist']['name']
  let img = song['thumbnails'][0]['url']
return {vidId:id,img,artist}
}



app.get("/",function(req,res){
    res.send("hi")
})


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
    const data  = await getMusicVideo(title)
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
  //fields=(next, previous, items(track(name, album(images), artists(name))))&
      const url = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=5&offset=${offset}`
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
          prev:data.previous,
          total:data.total
      }
      }
      catch(e){
        console.log(e)
      }


  }

  // async function getVideoInfo(videoTitle){
  //   try{
  //     const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${videoTitle}&key=${youtube_key}`
  //     const response = await fetch(url);
  //    const data = await response.json();
  //    console.log(data)
  //    const item = data.items[0]
  //    const vidId = item.id.videoId
  //    const title = item.snippet.title
  //    const channel = item.snippet.channelTitle
  //    console.log(item)
  //    const img = item.snippet.thumbnails.high.url
  //    const vidurl = `https://www.youtube.com/watch?v=${vidId}`
  //    return {
  //        vidId,title,channel,img,vidurl
  //    }
  //   }
  //   catch(e){
  //     console.log(e)
  //   }

  // }

async function downloadVideo(id,link,res,name){
  try{
    console.log(id)
    let info = await ytdl.getInfo(id);
    
    //receive a readable stream from ytdl   
     

    let stream = ytdl.downloadFromInfo(info,{filter:"audioonly",quality:"highestaudio"})
    
    

    const ffmpegCommand = spawn(ffmpegPath, [
      '-i', 'pipe:0',       // Input from stdin (pipe:0)
      '-vn',                // Disable video processing
      '-acodec', 'libmp3lame', // Use libmp3lame codec for audio
      '-ar', '44100',       // Set audio sampling rate to 44100 Hz
      '-ac', '2',           // Set number of audio channels to 2 (stereo)
      '-b:a', '128k',       // Set audio bitrate to 128k
      '-f', 'mp3',          // Force output format to MP3
      'pipe:1'              // Output to stdout (pipe:1)
    ]);


      stream.pipe(ffmpegCommand.stdin)
  
      


      res.set('Content-disposition', 'attachment; filename=' + encodeURI(`${name}.mp3`));
      res.set('Content-Type', 'audio/mp3');
      ffmpegCommand.stdout.pipe(res)

      let outputBytes = 0
      ffmpegCommand.stdout.on('data', (chunk) => {
        outputBytes += chunk.length;
        console.log(`Wrote ${outputBytes} bytes to output`);
      });

      ffmpegCommand.stderr.on('data', (data) => {
        console.error('Error:', data.toString());
      });
      
      ffmpegCommand.on('close', (code) => {
        if (code === 0) {
          console.log('Conversion complete.');
           //there will be no pipe Error: Output #0, mp3, to 'pipe:':
        } else {
          console.error('ffmpeg process exited with code:', code);
        }
      });
  }
  catch(e){
    console.log(e)
  }


}

