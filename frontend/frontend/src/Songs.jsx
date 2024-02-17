import React from 'react'
import {useEffect,useState} from 'react'
import { FileSaver } from 'file-saver';
import { useRef } from 'react';

export default function Songs() {
    const [allData,setAllData] = useState([])
    const [fetchCount,setFetchCount] = useState(0)
    const [offset,setOffset] = useState(0)
    const next  = useRef(false)
    const prev  = useRef(false)
    const dataArr = useRef([])
    async function getPlaylist(){
        let promises = [];
        let dataPromises = [];
        try{
            let token = localStorage.getItem("token")
            console.log("token is",token)
            const result  = await fetch(`http://localhost:3000/playlists/5MgsswPUrKtMJcwHwG9erH/${token}/${offset}`)
            const data = await result.json()
            console.log(data)
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
            setFetchCount(data.tracks.length)
            // data.tracks.forEach((track) => {
            //     const title =  `${track.songName}-${track.artist}`
            //     promises.push(fetch(`http://localhost:3000/videos/${title}`));
            //     titleMap[track.songName] = `http://localhost:3000/videos/${title}`
            // })

            data.tracks.forEach(async (track) => {
                const title =  `${track.songName}-${track.artist}`
                const res = await fetch(`http://localhost:3000/videos/${title}`);
                const data = await res.json();
                data.title = track.songName;
                dataArr.current.push(data)
                setFetchCount(prev => prev - 1)
            })
            // setAllData(prev => {
            //     const c = [...prev]
            //     c.push(data)
            //     return c
            // })
            
        //     promises.forEach(promise => {
        //         dataPromises.push(
        //             promise.then(response => response.json())
        //         );
        //     });

        //     Promise.all(dataPromises)
        //     .then(dataArray => {
        //         setAllData(dataArray)
        //         console.log(allData);
        //         console.log("Fetching process completed.");
        //         console.log(dataArray)
        //     })
        //     .catch(error => {
        //   // Handle any errors that might occur during the fetching process
        //     console.error("Error occurred during data fetching:", error);
        // });

        }
        catch(e){
            console.log(e)
        }

    }

    useEffect(() => {
        if(fetchCount == 0){
            console.log("SETTING")
            setAllData(dataArr.current)
        }
        return () => {
            
        }
    }, [fetchCount])

    useEffect(() => {
        getPlaylist()
        // setAllData([
        //     {
        //       vidId: "BPJIQhjzR7g",
        //       title: "Paul McCartney - Hope Of Deliverance",
        //       channel: "Channel 1",
        //       img: "https://example.com/image1.jpg",
        //       vidurl: "https://example.com/video1"
        //     },
        //     {
        //       vidId: "lvBOZCrJsAI",
        //       title: "Electric Light Orchestra - Livin' Thing (Official Video)",
        //       channel: "Channel 2",
        //       img: "https://example.com/image2.jpg",
        //       vidurl: "https://example.com/video2"
        //     },
        //     {
        //       vidId: "-T_ZkacL9A0",
        //       title: "Paul McCartney - No More Lonely Nights (Official Music Video)",
        //       channel: "Channel 3",
        //       img: "https://example.com/image3.jpg",
        //       vidurl: "https://example.com/video3"
        //     },
        //     {
        //       vidId: "wADRRYNHhOA",
        //       title: "JEALOUS GUY. (Ultimate Mix, 2020) - John Lennon and The Plastic Ono Band (w the Flux Fiddlers)",
        //       channel: "Channel 4",
        //       img: "https://example.com/image4.jpg",
        //       vidurl: "https://example.com/video4"
        //     },
        //     {
        //       vidId: "uVXR2LYeFBI",
        //       title: "WATCHING THE WHEELS. (Ultimate Mix, 2020) - John Lennon (official music video HD)",
        //       channel: "Channel 5",
        //       img: "https://example.com/image5.jpg",
        //       vidurl: "https://example.com/video5"
        //     }
        // ])
        return () => {
            
        }
    }, [offset])

    function downloadAll(){
        console.log("all data",allData)
        allData.forEach(vid => {
            window.open(`http://localhost:3000/video/${vid.vidId}/${vid.title}`)
        })
    }

    function prevPage(){
        dataArr.current = []
        setAllData(dataArr.current)
        setOffset(offset - 5)
    }

    function nextPage(){
        dataArr.current = []
        setAllData(dataArr.current)
        setOffset(offset + 5)
    }

    return (
        <div className="bg-green-400 w-screen h-screen">
            <div className="flex flex-col px-6 py-5 items-start bg-yellow-300">
            {fetchCount == 0 ? allData.map(vid => {
                console.log(vid)
                const link = `http://localhost:3000/video/${vid.vidId}/${vid.title}`
                return <div className="flex flex-row justify-between bg-red-700 w-full mt-4 py-2 ">
                <span className="tracking-widest text-xl">{vid.title}</span>
                <a href={link} target="_blank" className="text-black font-black underline">Download</a>
                </div>
                
            }) : null}
            </div>
            <div className="w-full flex flex-row justify-between p-5">
            {prev.current ? <btn onClick={prevPage} className="cursor-pointer border border-solid border-blue-600 py-1 px-2 rounded-full">prev</btn> : <div></div>}
            <btn onClick={downloadAll} className="cursor-pointer border border-solid border-blue-600 py-1 px-2 rounded-full">Download ALL</btn>
            {next.current ? <btn onClick={nextPage} className="cursor-pointer border border-solid border-blue-600 py-1 px-2 rounded-full">next</btn> : <div></div>}
            </div>
        </div>
    )
}


//if we have a url we can download from we can use axios or whatever
//if we have a url that returns a stream of data with correct content-disposition it automatically downloads