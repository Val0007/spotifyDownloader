import {React,useEffect} from 'react'
import { useParams } from 'react-router-dom';
import {Buffer} from 'buffer'
import queryString from 'query-string';
import { useSearchParams } from 'react-router-dom';
import {useNavigate} from 'react-router-dom'

//http://localhost:5173/callback?code=AQAmFP4lTBjWTtbxraUlxaWYm0dIILZ0htdQVW-CQZHqgZPLDczyjHhouAHaNAJtCsOQmI7ZgKA8ZhL_3_Jbb_GSd4T_htsVEabIJMA_2UhyK3DXPQXJBGU2c3JS_nAA2vtdHkdAzWXa_h_HHRQ3cPxXxOVSJm6oPUv-yZVSCdlWhEvy_i5Qw6O7FFDfTlGnoAYp8ckOf24pc4RB56ZTPi14v2E5rdD86kf-yQ&state=ohcCj0LRuCd6OoWy

export default function Callback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const code = searchParams.get("code")
    console.log("CODE IS",code)
    var client_id = 'c06ca7d6395a410884815f9c38596f4c';
    var client_secret = '246e22c8b35943b3b020827dd81a10b1';
    
    async function getToken(){
        try{
            var authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                  code: code,
                  redirect_uri: "http://localhost:5173/callback",
                  grant_type: 'authorization_code'
                },
                headers: {
                  'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                json: true
              };
              const response = await fetch(authOptions.url, {method: 'POST', body: queryString.stringify(authOptions.form),headers:authOptions.headers});
              const data = await response.json();
              console.log(data["access_token"]);
              localStorage.setItem("token",data['access_token'])
              console.log("item is ",localStorage.getItem("token"),"TOKEEN")
              navigate("/songs")
        }
        catch(e){
            console.log(e)
        }

    }
    useEffect(() => {
        getToken()
        return () => {
            
        }
    }, [])

    return (
        <div>
            
        </div>
    )
}
