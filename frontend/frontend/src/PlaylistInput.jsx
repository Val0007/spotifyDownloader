import { useEffect, useState } from "react"
import { useAuth } from './AuthHook';
import {useNavigate} from 'react-router-dom'


export default function PlaylistInput() {
    const {accessToken:token} = useAuth()
    const [offset,setOffset] = useState(0)
    const [next,setNext] = useState(false)
    const [prev,setPrev] = useState(false)
    const [playlistData,setPlayListData] = useState([])
    const navigate = useNavigate();


    useEffect(()=>{

        console.log(import.meta.env.BASE_URL)

        async function getPlaylistData(){
            const url = `https://api.spotify.com/v1/me/playlists?limit=8&offset=${offset}`;
            try {
                const response = await fetch(url, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
            
                if (response.ok) {
                  const data = await response.json();
                  console.log(data)
                  if(data.next != null ){
                    setNext(true)
                  }
                  else{
                    setNext(false)
                  }
                  if(data.previous != null){
                    setPrev(true)
                  }
                  else{
                    setPrev(false)
                  }

                  const d = data.items.map(playlist => {
                    return {
                        id:playlist['id'],
                        name:playlist['name'],
                        image:playlist['images'][0]['url'],
                        owner:playlist["owner"]["display_name"]
                    }
                  })
                  console.log(d)
                  setPlayListData(d)




                } else {
                  console.error('Error:', response.status, response.statusText);
                }
              } catch (error) {
                console.error('Fetch Error:', error);
              }
        }

        getPlaylistData()
        window.scrollTo(0,0)

    },[offset])



    return (
        <div className=" bg-gradient-to-b from-playlistblue to-playlistblack w-screen min-h-screen lg:h-screen flex justify-center flex-col items-center">
            <div className=" text-3xl font-black tracking-widest text-white pt-2 pl-6 ">Your Playlists</div>
            <div className="flex flex-col lg:grid lg:grid-cols-4 lg:gap-x-6 lg:p-10 lg:h-5/6">
            {playlistData.map((playlist)=>{
                return <div key={playlist.id} className="mt-5 lg:mt-0 cursor-pointer bg-playlistcard flex flex-col py-4 w-52 rounded-md h-60"
                onClick={()=>{
                    navigate(`/songs?playlistid=${playlist.id}`)
                }}
                >
                    <div className="h-4/6 bg-red-300 self-center cursor-pointer">
                        <img src={playlist.image} className="h-full w-full" alt="" />
                    </div>
                    <div className="mt-4 overflow-hidden flex px-2"><span className=" text-playlistname capitalize truncate block">{playlist.name}</span></div>
                    <div className="mt-2 overflow-hidden flex px-2"><span className=" text-playlistauthor">{playlist.owner}</span></div>
                </div>
            })}
            </div>
            <div className="mt-5 lg:mt-0 flex flex-row justify-center lg:justify-around items-center w-full">
                {prev ? <div className="mr-1 lg:mr-0 text-white border-spotifygreen border-2 py-1 px-6 rounded-full cursor-pointer"
                 onClick={()=>{
                    setOffset(prev => {
                        return prev - 8
                    })
                 }}
                >Prev</div> : <div></div> }
                {next ? <div className=" text-white border-spotifygreen border-2 py-1 px-6 rounded-full cursor-pointer" 
                onClick={()=>{
                                        setOffset(prev => {
                                            return prev + 8
                                        })
                }}>Next</div> : <div></div> }
            </div>
        </div>
    )
}
