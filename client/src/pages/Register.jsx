import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useEffect, useState } from "react"

export default function Register() {
  const navigate = useNavigate()

  const [userError, setUserError] = useState(null)
  useEffect(() => {
    if (localStorage.getItem("username")) {
      navigate("/chats")
    }
  })

  async function register(e) {
    e.preventDefault()
    const username = e.target.elements.user.value
    const password = e.target.elements.password.value
    const passwordCheck = e.target.elements.checkPassword.value
    if (username.length >= 4 && password.length >= 8) {
      if (password === passwordCheck) {
        try {
          const response = await axios.post(
            `http://${window.location.hostname}:5000/register`,
            {
              user: username,
              password,
            }
          )

          if (response.status === 200) {
            localStorage.setItem("username", username)
            localStorage.setItem("password", password)
            localStorage.removeItem("talking-to")
            navigate("/chats")
          } else {
            setUserError(response.data.message)
          }
        } catch (error) {
          setUserError(error.message)
        }
      } else {
        setUserError("Passwords don't match")
      }
    } else {
      setUserError("Username/Password too small")
    }
  }

  return (
    <form onSubmit={register} className="register-form">
      {userError && <p style={{ color: "red" }}>{userError}</p>}
      <h1>Register</h1>
      <input
        type="text"
        name="user"
        id="user"
        placeholder="Username"
        minLength={4}
      />
      <input
        type="password"
        id="user-password"
        name="password"
        placeholder="Password"
        minLength={8}
      />
      <input
        type="password"
        id="check-password"
        name="checkPassword"
        placeholder="Repeat Password"
        minLength={8}
      />
      <p className="auth-text">
        You have an account?
        <Link
          to="/"
          style={{
            color: "rgb(72, 200, 160)",
            display: "inline-block",
            marginLeft: "5px",
            textDecoration: "none",
          }}>
          Login
        </Link>
      </p>
      <button type="submit">Submit register</button>
    </form>
  )
}
