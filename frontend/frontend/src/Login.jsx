import React, { useEffect } from 'react'

export default function Login() {

    useEffect(()=>{
        console.log(import.meta.env)
    },[])

    return (
        <div className="h-screen w-screen flex flex-col justify-center items-center bg-green-800 p-4">

            <div className=' text-xl text-center font-bold text-white tracking-widest mb-4'>Dowload all your songs in a playlist with a single click!</div>

            <div className="m-h-10 min-w-[12] py-4 px-4 flex justify-center items-center rounded-md bg-black cursor-pointer" onClick={getAccessToken}>
            <div>
                <img className=" h-8 w-8 mr-2" src="spotify-2.svg" alt=""/>
            </div>
            <span className="text-3xl text-white">Login with spotify</span>
            </div>
        
        </div>
    )


    async function getAccessToken(){
        try{
            window.location.replace(`https://accounts.spotify.com/authorize?response_type=code&client_id=${import.meta.env.VITE_client_id}&scope=user-read-private%20playlist-read-private&redirect_uri=${import.meta.env.VITE_base_url}/callback&state=ohcCj0LRuCd6OoWy`)
        }
        catch(e){

        }
    }
}
