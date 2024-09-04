import React from 'react'
import {useEffect,useState} from 'react'
import { FileSaver } from 'file-saver';
import { useRef } from 'react';
import { useAuth } from './AuthHook';
import { useSearchParams } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";

export default function Songs() {
    const [allData,setAllData] = useState([])
    const [offset,setOffset] = useState(0)
    const next  = useRef(false)
    const prev  = useRef(false)
    const totalSongs = useRef(0)
    const currentPage = useRef(1)
    const [searchParams] = useSearchParams();
    const playlistid = searchParams.get("playlistid")
    const [pagesArr,setPagesArr] = useState([])
    const [isDownloading,setIsDownloading] = useState(false)


    const {accessToken:token} = useAuth()
    console.log(token)

    function generatePages() {
        //limit is 5 in server
        //208/5 = 41.6 -> 41 pages , offset for page 25 is 25*5 => 125 - 130 songs , 41 * 5 -> 205 - 210
        //nop = //9/5 = 1
        const numberofpages = Math.floor(totalSongs.current / 5);
        
        // If there's only one page
        if (numberofpages <= 1) {
            setPagesArr([1]);
            return;
        }
    
        // If the number of pages is small (like 2 or 3)
        if (numberofpages <= 3) {
            let pages = [];
            for (let i = 1; i <= numberofpages; i++) {
                pages.push(i);
            }
            setPagesArr(pages);
            return;
        }
    
        if (currentPage.current != numberofpages) {
            if (currentPage.current == 1) {
                setPagesArr([currentPage.current, currentPage.current + 1, currentPage.current + 2, numberofpages]);
                return;
            }
            if (currentPage.current + 1 == numberofpages) { // 41
                setPagesArr([1, currentPage.current - 2, currentPage.current - 1, currentPage.current, numberofpages]);
                return;
            } else if (currentPage.current + 2 == numberofpages) { // 40
                setPagesArr([1, currentPage.current - 1, currentPage.current, currentPage.current + 1, numberofpages]);
                return;
            }
            setPagesArr([currentPage.current - 1, currentPage.current, currentPage.current + 1, numberofpages]);
        } else { // 42
            setPagesArr([1, currentPage.current - 3, currentPage.current - 2, currentPage.current - 1, numberofpages]);
        }
    }
    

    async function getPlaylist(){
        try{
            const result  = await fetch(`${import.meta.env.VITE_server_url}/playlists/${playlistid}/${token}/${offset}`)
            const data = await result.json()
            console.log(data)
            setIsDownloading(true)
            if(data.next){
                next.current = true
            }
            else{
                next.current = false
            }
            if(data.prev != null){
                prev.current = true
            }
            else{
                prev.current = false
            }
            totalSongs.current = data.total
            generatePages()
            const d = data.tracks.map(async (track) => {
                console.log("fff")
                const title =  `${track.songName}-${track.artist}`
                const res = await fetch(`${import.meta.env.VITE_server_url}/videos/${title}`);
                const data = await res.json();
                console.log(data)
                data.title = track.songName;
                return data
            })
            const results = await Promise.all(d);
            setIsDownloading(false)
            setAllData(results)

        }
        catch(e){
            console.log(e)
        }

    }

    useEffect(() => {
        getPlaylist()
    }, [offset])

    useEffect(()=>{
        console.log(isDownloading)
    },[isDownloading])

    function downloadAll(){
        console.log("all data",allData)
        allData.forEach(vid => {
            handleDownload(`${import.meta.env.VITE_server_url}/video/${vid.vidId}/${vid.title}`,vid.title)
        })
    }

    const handleDownload = async (link,name) => {
        try {
         setIsDownloading(true)
          const response = await fetch(link, {
            method: 'GET',
          });
          const reader = response.body.getReader();
          const contentLength = +response.headers.get('Content-Length');
        
          let receivedLength = 0;
          const chunks = [];
        
          while(true) {
            const {done, value} = await reader.read();
        
            if (done) {
              break;
            }
        
            chunks.push(value);
            receivedLength += value.length;
            console.log(`Received ${receivedLength} of ${contentLength}`);
            // Update progress state here
          }
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
    
          // Get the filename from the Content-Disposition header
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = name;
          if (contentDisposition) {
            const matches = /filename="?([^"]*)"?;?/.exec(contentDisposition);
            if (matches != null && matches[1]) { 
                filename = decodeURI(matches[1]); 
            }
        }
    
          // Create a Blob from the response
          const blob = new Blob(chunks)
    
          // Create a link element, set the download attribute with the filename
          // and click it programmatically
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          setIsDownloading(false)
          a.click();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Download failed:', error);
        }
      };

    function prevPage(){
        currentPage.current = currentPage.current - 1
        generatePages()
        setOffset(offset - 5)
    }

    function nextPage(){
        currentPage.current = currentPage.current + 1
        generatePages()
        setOffset(offset + 5)
    }


    return (
        <div className="bg-gradient-to-b from-playlistblue to-playlistblack w-screen h-screen flex justify-center flex-col items-center relative">
            <a className='text-sm font-bold text-spotifygreen underline cursor-pointer' href='/playlists'>Back to PlayLists</a>
            <div className=" text-3xl font-black tracking-widest text-white pt-2 pl-6 ">Your Songs</div>
            { isDownloading ? <div className='  bg-slate-700/40 h-full w-full absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center z-30'>
                <ClipLoader
                    color='#ffffff'
                    loading={isDownloading}
                    cssOverride={{}}
                    size={150}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>  : null }

            <div className="flex flex-col px-6 py-5 items-start w-full lg:w-3/6 z-0">
            {allData.map(vid => {
                const link = `${import.meta.env.VITE_server_url}/video/${vid.vidId}/${vid.title}`
                return <div className="flex flex-row bg-playlistcard w-full mt-4 h-14 items-center rounded-md" key={vid.vidId}>
                <div className=' bg-blue-400 h-full w-16 rounded-lg '>
                    <img src={vid.img} className='h-full w-full rounded-md object-fill' alt="" />
                </div>
               <div className='ml-4 w-4/6 truncate'><span className="tracking-widest text-xs lg:text-xl font-black text-playlistname ">{vid.title}</span></div>
                {/* <a href={link} target="_blank" className="text-black font-black underline">Download</a> */}
                <button onClick={()=>{
                    handleDownload(link,vid.title)
                    console.log("yesss")
                }} className="cursor-pointer text-spotifygreen font-black underline text-xs lg:text-base ">Download</button>
                </div>
                
            })}
            </div>
            <div className="w-full lg:w-3/6 flex flex-row justify-between p-5">
            {prev.current ? <button onClick={prevPage} className="text-xs lg:text-base text-white cursor-pointer border border-solid border-spotifygreen py-1 px-2 rounded-full">Prev</button> : <div></div>}
            <button onClick={downloadAll} className="text-xs lg:text-base text-white cursor-pointer border border-solid border-spotifygreen py-1 px-2 rounded-full">Download All</button>
            {next.current ? <button onClick={nextPage} className="text-xs lg:text-base text-white cursor-pointer border border-solid border-spotifygreen py-1 px-2 rounded-full">Next</button> : <div></div>}
            </div>
            <div className="w-1/6 flex flex-row justify-center items-center p-5">
            {pagesArr.map(page => {
                const className =  `${currentPage.current == page ?'p-1 rounded-md  border-2 border-spotifygreen cursor-pointer text-spotifygreen font-medium mr-3' : 'p-1 cursor-pointer text-spotifygreen font-medium underline mr-3'}`
                return <div className={className} key={page}
                onClick={()=>{
                    currentPage.current = page
                    setOffset(currentPage.current * 5)
                    generatePages()
                }}  
                >{page}</div>
            })}
            </div>
        </div>
    )
}


//if we have a url we can download from we can use axios or whatever
//if we have a url that returns a stream of data with correct content-disposition it automatically downloads



// {      "collaborative": false,     
//  "description": "",     
//   "external_urls": {        
//     "spotify": "https://open.spotify.com/playlist/4hncZSAKelfiEPArhTLqjD"     
//  },    
//    "href": "https://api.spotify.com/v1/playlists/4hncZSAKelfiEPArhTLqjD",   
//       "id": "4hncZSAKelfiEPArhTLqjD",     
//        "images": [        {       
//            "url": "https://mosaic.scdn.co/640/ab67616d00001e0287781996775435b9b6b75206ab67616d00001e029e691d19ee8eaba9290aee1fab67616d00001e02cf06b7a58c6bf3e90102bf05ab67616d00001e02f3aa0e6ca22a382007f61e4d",       
//               "height": 640,          "width": 640  
//                   },       
//                    {         
//                      "url": "https://mosaic.scdn.co/300/ab67616d00001e0287781996775435b9b6b75206ab67616d00001e029e691d19ee8eaba9290aee1fab67616d00001e02cf06b7a58c6bf3e90102bf05ab67616d00001e02f3aa0e6ca22a382007f61e4d",          "height": 300,          "width": 300        },       
//                       {          "url": "https://mosaic.scdn.co/60/ab67616d00001e0287781996775435b9b6b75206ab67616d00001e029e691d19ee8eaba9290aee1fab67616d00001e02cf06b7a58c6bf3e90102bf05ab67616d00001e02f3aa0e6ca22a382007f61e4d",          "height": 60,          "width": 60        }      ],      "name": "Val collab",      "owner": {        "external_urls": {          "spotify": "https://open.spotify.com/user/87azi2sea4212eit768k2bx3h"        },        "href": "https://api.spotify.com/v1/users/87azi2sea4212eit768k2bx3h",        "id": "87azi2sea4212eit768k2bx3h",        "type": "user",        "uri": "spotify:user:87azi2sea4212eit768k2bx3h",        "display_name": "Aryan"      },      "public": true,      "snapshot_id": "AAAAPNLuf9+1VE9wnt3oBaLxWwZUeuWI",      "tracks": {        "href": "https://api.spotify.com/v1/playlists/4hncZSAKelfiEPArhTLqjD/tracks",        "total": 57      },      "type": "playlist",      "uri": "spotify:playlist:4hncZSAKelfiEPArhTLqjD",      "primary_color": null    },

            // setAllData([
            //     {
            //       vidId: "BPJIQhjzR7g",
            //       title: "Paul McCartney - Hope Of Deliverance",
            //       channel: "Channel 1",
            //       img: "https://i.iheart.com/v3/catalog/album/624039?ops=fit(480%2C480)",
            //       vidurl: "https://example.com/video1"
            //     },
            //     {
            //       vidId: "lvBOZCrJsAI",
            //       title: "Electric Light Orchestra - Livin' Thing (Official Video)",
            //       channel: "Channel 2",
            //       img: "https://i.iheart.com/v3/catalog/album/624039?ops=fit(480%2C480)",
            //       vidurl: "https://example.com/video2"
            //     },
            //     {
            //       vidId: "-T_ZkacL9A0",
            //       title: "Paul McCartney - No More Lonely Nights (Official Music Video)",
            //       channel: "Channel 3",
            //       img: "https://i.iheart.com/v3/catalog/album/624039?ops=fit(480%2C480)",
            //       vidurl: "https://example.com/video3"
            //     },
            //     {
            //       vidId: "wADRRYNHhOA",
            //       title: "JEALOUS GUY. (Ultimate Mix, 2020) - John Lennon and The Plastic Ono Band (w the Flux Fiddlers)",
            //       channel: "Channel 4",
            //       img: "https://i.iheart.com/v3/catalog/album/624039?ops=fit(480%2C480)",
            //       vidurl: "https://example.com/video4"
            //     },
            //     {
            //       vidId: "uVXR2LYeFBI",
            //       title: "WATCHING THE WHEELS. (Ultimate Mix, 2020) - John Lennon (official music video HD)",
            //       channel: "Channel 5",
            //       img: "https://i.iheart.com/v3/catalog/album/624039?ops=fit(480%2C480)",
            //       vidurl: "https://example.com/video5"
            //     }
            // ])