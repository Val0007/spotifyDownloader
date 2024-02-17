import React from 'react'

export default function Login() {
    return (
        <div className="h-screen w-screen flex justify-center items-center bg-green-800">

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
            window.location.replace('https://accounts.spotify.com/authorize?response_type=code&client_id=c06ca7d6395a410884815f9c38596f4c&scope=user-read-private%20playlist-read-private&redirect_uri=http://localhost:5173/callback&state=ohcCj0LRuCd6OoWy')
        }
        catch(e){

        }
    }
}
