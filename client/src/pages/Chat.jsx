import { io } from "socket.io-client"
import { useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import "./styles.css"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Chat() {
  const socket = useRef()
  const isConnected = useRef(false)

  const [messages, setMessages] = useState([])
  const [userMessage, setUserMessage] = useState("")
  const [chatList, setChatList] = useState([])
  const [isShownChatList, setIsShownChatList] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (!isConnected.current) {
      socket.current = io(`http://${window.location.hostname}:5000`)
      isConnected.current = true
      socket.current.emit("enter", localStorage.getItem("chat-name"))

      socket.current.on("receive-message", (msg) => {
        const newMessage = (
          <li key={uuidv4()}>
            <p>{msg}</p>
          </li>
        )
        setMessages((prevMessages) => [...prevMessages, newMessage])
      })
    }
  }, [isConnected])

  function sendMessage(e) {
    e.preventDefault()
    if (userMessage.length > 0) {
      socket.current.emit("send-message", userMessage)
      const newMessage = (
        <li key={uuidv4()}>
          <p>
            {localStorage.getItem("chat-name")}: {userMessage}
          </p>
        </li>
      )
      if (!userMessage.includes("/pm ")) {
        setMessages((prevMessages) => [...prevMessages, newMessage])
      }

      setUserMessage("")
    }
  }

  function disconnect(e) {
    e.preventDefault()
    localStorage.removeItem("chat-name")
    socket.current.disconnect()
    navigate("/")
  }

  function getUsersList(e) {
    e.preventDefault()
    if (isShownChatList === false) {
      axios
        .get(`http://${window.location.hostname}:5000/getUsersList`)
        .then((list) => {
          let users = list.data.map((user, index) => (
            <li key={uuidv4()}>
              <p>{list.data[index]}</p>
            </li>
          ))
          setChatList(users)
          setIsShownChatList(true)
        })
    } else {
      setIsShownChatList(false)
      setChatList([])
    }
  }

  return (
    <div>
      {isShownChatList && (
        <div id="chat-list">
          <h1>Chat List</h1>
          <hr />
          <ul>{chatList}</ul>
        </div>
      )}
      <ul id="messages">{messages}</ul>
      <form id="form" onSubmit={(e) => sendMessage(e)}>
        <input
          id="input"
          autoComplete="off"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <button id="send">Send</button>
        <button id="disconnect" onClick={(e) => disconnect(e)}>
          Disconnect
        </button>
        <button id="chatlist" onClick={(e) => getUsersList(e)}>
          Chat List
        </button>
      </form>
    </div>
  )
}
