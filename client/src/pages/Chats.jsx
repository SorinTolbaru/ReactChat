import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { v4 as uuidv4 } from "uuid"
import "./styles.css"
import UserList from "../components/UserList"
import ChatMessages from "../components/ChatMessages"
import { useNavigate } from "react-router-dom"

export default function Chats() {
  const socket = useRef()

  const [messages, setMessages] = useState([])

  const [userList, setUserList] = useState([])
  const [allUserList, setAllUserList] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [statusTalkingto, setStatusTalkingto] = useState("offline")
  const [talkingTo, setTalkingTo] = useState(undefined)

  const [isTyping, setIsTyping] = useState(false)
  const [timer, setTimer] = useState(null)

  const currentUser = useRef(localStorage.getItem("username"))
  const [newMessageUsers, setNewMessageUsers] = useState([])
  const [showPop, setShowPop] = useState(false)

  const navigate = useNavigate()
  let isConnected = useRef(false)

  //scroll bottom
  useEffect(() => {
    const messagesElement = document.getElementsByClassName("messages")[0]
    if (messagesElement) {
      messagesElement.scrollTo(0, messagesElement.scrollHeight)
    }
  }, [messages])

  //detect user change
  useEffect(() => {
    if (localStorage.getItem("username") !== currentUser.current) {
      disconnectUser()
    }
  })

  useEffect(() => {
    if (!isConnected.current) {
      socket.current = io(`http://${window.location.hostname}:5000`)
      socket.current.emit(
        "enter",
        localStorage.getItem("username"),
        localStorage.getItem("id")
      )
      if (
        localStorage.getItem("username") === null &&
        localStorage.getItem("id") === null
      ) {
        disconnectUser()
      }
      isConnected.current = true

      //set all socket on so it doesnt add up the ons
      socket.current.on("recive-message", (msg) => {
        if (localStorage.getItem("talking-to") === msg.from) {
          let limsg = (
            <li key={uuidv4()}>
              <p>{msg.message}</p>
            </li>
          )
          setMessages((prevMessages) => [...prevMessages, limsg])
        } else {
          setNewMessageUsers((newMessageUsers) => [
            ...newMessageUsers,
            msg.from,
          ])
        }
      })

      socket.current.on(
        "update-user-list",
        (onlineUsers, users, validPassword) => {
          if (validPassword) {
            setUserList(onlineUsers)
            if (users) {
              setAllUserList(users)
            }
          } else {
            disconnectUser()
          }
        }
      )

      socket.current.on("update-status", (users) => {
        users.includes(localStorage.getItem("talking-to"))
          ? setStatusTalkingto("user-online")
          : setStatusTalkingto("user-offline")
      })

      socket.current.on("get-messages", (messages) => {
        if (messages.length === 0) {
          setMessages([])
        } else {
          let limsg = messages.map((msgobj) => (
            <li
              key={uuidv4()}
              className={
                msgobj.from === localStorage.getItem("username") ? "li-to" : ""
              }>
              {" "}
              <p>{msgobj.message}</p>
            </li>
          ))
          setMessages((prevMessages) => [...prevMessages, limsg])
        }
      })

      socket.current.on("user-typing", (typingStatus) => {
        setIsTyping(typingStatus)
      })
    }
  })

  function sendMessage(e) {
    e.preventDefault()
    if (e.target.elements.msg.value.length >= 1) {
      let msg = {
        message: e.target.elements.msg.value,
        from: localStorage.getItem("username"),
        to: talkingTo,
      }
      let limsg = (
        <li key={uuidv4()} className="li-to">
          {" "}
          <p>{msg.message}</p>
        </li>
      )
      setMessages((prevMessages) => [...prevMessages, limsg])
      setInputValue("")
      socket.current.emit("send-message", msg)
    }
  }

  function getMessages(user) {
    setTalkingTo(user)
    localStorage.setItem("talking-to", user)
    setMessages([])

    setNewMessageUsers((NewMessageUsers) =>
      NewMessageUsers.filter((userToRemove) => userToRemove !== user)
    )
    if (!userList.includes(user)) {
      setUserList((userList) => [...userList, user])
    }

    socket.current.emit("get-messages", user)
  }

  function disconnectUser() {
    localStorage.removeItem("username")
    localStorage.removeItem("id")
    localStorage.removeItem("talking-to")
    socket.current.disconnect()
    navigate("/")
  }

  function deleteMessages(talkingto) {
    socket.current.emit("delete-messages", talkingto)
    setMessages([])
    setShowPop(!showPop)
  }

  function checkUserTyping(tellTo) {
    if (!isTyping) {
      socket.current.emit("user-typing", {
        isTyping: "is typing...",
        to: tellTo,
      })
    }
    setIsTyping(true)
    clearTimeout(timer)
    setTimer(
      setTimeout(() => {
        setIsTyping(false)
        socket.current.emit("user-typing", { isTyping: false, to: tellTo })
      }, 1000)
    )
  }

  return (
    <div className="chat">
      <UserList
        users={userList}
        allUsers={allUserList}
        getMessages={getMessages}
        disconnectUser={disconnectUser}
        newMessageUsers={newMessageUsers}
      />
      <ChatMessages
        messages={messages}
        inputValue={inputValue}
        talkingTo={talkingTo}
        sendMessage={sendMessage}
        setInputValue={setInputValue}
        status={statusTalkingto}
        deleteMessages={deleteMessages}
        showPop={showPop}
        setShowPop={setShowPop}
        checkUserTyping={checkUserTyping}
        isTyping={isTyping}
      />
    </div>
  )
}
