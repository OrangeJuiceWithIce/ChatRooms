import ChatsRoom from './pages/ChatsRoom/ChatsRoom.tsx'
import SetName from './pages/SetName/SetName.tsx'
import {Routes,Route} from'react-router-dom'

function App(){
  return(
    <Routes>
      <Route path='/' element={<SetName />}/>
      <Route path='/chatsroom' element={<ChatsRoom />} />
    </Routes>
  )
}
export default App;