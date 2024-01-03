import { io } from "socket.io-client"
import { useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import "./styles.css"

export default function Chat() {
  const socket = useRef()
  const isConnected = useRef(false)
  const [messages, setMessages] = useState([])
  const [userMessage, setUserMessage] = useState("")

  useEffect(() => {
    if (!isConnected.current) {
      socket.current = io(`http://${window.location.hostname}:5000`)
      isConnected.current = true
      socket.current.emit("enter")

      socket.current.on("receive-message", (msg) => {
        const newMessage = (
          <li key={uuidv4()}>
            <p>User: {msg}</p>
          </li>
        )
        setMessages((prevMessages) => [...prevMessages, newMessage])
      })
    }
  }, [isConnected])

  function sendMessage(e) {
    e.preventDefault()
    socket.current.emit("send-message", userMessage)
    setUserMessage("")
  }

  return (
    <div>
      <ul id="messages">{messages}</ul>
      <form id="form" onSubmit={(e) => sendMessage(e)}>
        <input
          id="input"
          autoComplete="off"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <button id="send">Send</button>
      </form>
    </div>
  )
}
