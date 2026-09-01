import { useState } from 'react'
import './App.css'
import { Outlet } from 'react-router-dom'

function App() {
  const [dati, setDati] = useState(null);
  const [input, setInput] = useState(null);
  var alphEnc = {};
  var statesEnc = {}

  return (
    <Outlet context={{dati, setDati, input, setInput, alphEnc, statesEnc}}/>
  )
}

export default App