import { useState } from "react"
import "./styles.css"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [user, setUser] = useState("")
  const [isOnline, setIsOnline] = useState(false)
  const navigate = useNavigate()

  function enterChat(e) {
    e.preventDefault()
    axios
      .get(`http://${window.location.hostname}:5000/getUsersList`)
      .then((list) => {
        if (!list.data.includes(user)) {
          localStorage.setItem("chat-name", user)
          navigate("/Chat")
        } else {
          setIsOnline(true)
        }
      })
  }

  return (
    <div id="login-container">
      <form id="login" onSubmit={(e) => enterChat(e)}>
        {isOnline && (
          <p style={{ color: "red", fontSize: "1rem", fontWeight: "bold" }}>
            User already in chat
          </p>
        )}
        <label htmlFor="username">What's your name?</label>
        <input
          type="text"
          id="username"
          onChange={(e) => setUser(e.target.value)}
        />
        <input type="submit" value="Enter Chat" />
      </form>
    </div>
  )
}
