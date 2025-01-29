import React from 'react'


import Login from './Component/Login'
import Card from './Component/card'
import { Route, Routes } from 'react-router-dom'

export default function App() {
  return (
   
    
<>
<Routes>
    <Route path='/'element={<Login/>}/>
    <Route path='/Login'element={<Login />}/>
    <Route path="/Card" element={<Card />}/>
    <Route path='*'element={<h2>page not founding</h2>}/>


    </Routes>

</>
    
    
   
      
  )
}
