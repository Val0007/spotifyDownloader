import { useContext, useState, useEffect, createContext } from 'react';
import Login from './Login';
import { Outlet } from 'react-router-dom'; // v4/5
import {Buffer} from 'buffer'


const AuthContext = createContext({ accessToken:undefined,setAccessToken:undefined });


export const AuthProvider = (props) => {


    const [accessToken,setAccessToken] = useState()
    const [isLoading,setIsLoading] = useState(true)
    const [gotoLoginPage,setgotoLoginPage] = useState(false)

    //handle case where accessToken expires as we are using it

    useEffect(()=> {
        async function checkTokenData(){
        //see if access and refresh exists 
        if(localStorage.getItem("accesstoken") && localStorage.getItem("refreshtoken")){
            //check if token expired
            if(isTimeExceeded()){
            //get new access token
                console.log("token expired")
                await getRefreshToken()
            }
            setAccessToken(localStorage.getItem("accesstoken"))
            setIsLoading(false)
            setgotoLoginPage(false)
            //
            console.log("proceed to playlists page")
        }
        else{
            //Go to login page
            console.log("not logged in")
            setgotoLoginPage(true)
        }
        }

        checkTokenData()
    },[])

    const value = {accessToken,setAccessToken}

    return (
        //Only if Auth COMPLETES ANY CHILDREN WILL LOAD
        <AuthContext.Provider value={value}>
            {isLoading && !gotoLoginPage ? <>Loading</> : gotoLoginPage ? <Login></Login> : <Outlet /> }
        </AuthContext.Provider>
    );

}

function isTimeExceeded() {
    // Retrieve the date from localStorage (assuming it was stored as a string)
    const storedDateStr = localStorage.getItem('storedDate');

    // If there's no stored date, return false
    if (!storedDateStr) {
        console.log("yes")
        return false;
    }

    // Parse the stored date string to a Date object
    const storedDate = new Date(storedDateStr);

    // Get the current date and time
    const now = new Date();

    // Calculate the time difference in seconds
    const timeDifference = (now - storedDate) / 1000;
    console.log(timeDifference)

    // Check if the difference exceeds 3000 seconds
    return timeDifference > 3000;
}

function saveCurrentDate() {
    // Get the current date and time
    const now = new Date();

    // Convert the Date object to a string
    const dateStr = now.toISOString();

    // Save the string to localStorage under the key 'storedDate'
    localStorage.setItem('storedDate', dateStr);
}


const getRefreshToken = async () => {

    var client_id = import.meta.env.VITE_client_id;
    var client_secret = import.meta.env.VITE_client_secret;

    // refresh token that has been previously stored
    const refreshToken = localStorage.getItem('refreshtoken');
    const url = "https://accounts.spotify.com/api/token";
 
     const payload = {
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
       },
       body: new URLSearchParams({
         grant_type: 'refresh_token',
         refresh_token: refreshToken,
         client_id: import.meta.env.VITE_client_id
       }),
     }
     const body = await fetch(url, payload);
     const response = await body.json();
     console.log(response)
 
     localStorage.setItem('accesstoken', response['access_token']);
     saveCurrentDate()
     if (response['refresh_token']) {
        console.log("refresh")
        localStorage.setItem('refreshtoken', response['refresh_token']);
     }
   }


export const useAuth = () => {
    return useContext(AuthContext);
};