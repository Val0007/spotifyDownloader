import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import PlaylistInput from './PlaylistInput'
import Songs from './Songs';
import Callback from './Callback'
import { AuthProvider } from './AuthHook';
import Home from './RedirectToPlaylist';

function App() {
  return (
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route element={<AuthProvider/>}>
              <Route path="/playlists" element={<PlaylistInput />} />
            </Route>
            <Route element={<AuthProvider/>}>
              <Route path="/songs" element={<Songs />} />
            </Route>
            <Route path="/callback" element={<Callback/>}></Route>
         </Routes>
  )
}

export default App
