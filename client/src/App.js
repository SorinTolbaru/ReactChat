import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import Chat from "./pages/Chat"
import Login from "./pages/Login"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  )
}
