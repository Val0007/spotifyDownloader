import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import PlaylistInput from './PlaylistInput'
import Songs from './Songs';
import Callback from './Callback'
function App() {

  return (
    <div className="">
        <Routes>
            <Route path="/" element={<Login/>} />
            <Route path="/input" element={<PlaylistInput />} />
            <Route path="/songs" element={<Songs />} />
            <Route path="/callback" element={<Callback/>}></Route>
         </Routes>
    </div>
  )
}

export default App
