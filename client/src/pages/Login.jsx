import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useEffect, useState } from "react"

export default function Login() {
  const navigate = useNavigate()
  const [userError, setUserError] = useState(null)
  useEffect(() => {
    if (localStorage.getItem("username")) {
      navigate("/chat")
    }
  })

  async function login(e) {
    e.preventDefault()
    const username = e.target.elements.user.value
    const password = e.target.elements.password.value
    if (username.length >= 3) {
      try {
        const response = await axios.post(
          `http://${window.location.hostname}:5000/login`,
          {
            user: username,
            password,
          }
        )

        if (response.status === 200) {
          localStorage.setItem("username", username)
          localStorage.setItem("password", password)
          navigate("/chat")
        } else {
          setUserError(response.data.message)
        }
      } catch (error) {
        setUserError(error.message)
      }
    } else {
      setUserError("Username too small")
    }
  }

  return (
    <form onSubmit={login} className="login-form">
      {userError && <p style={{ color: "red" }}>{userError}</p>}
      <h1>Login</h1>
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
      <p className="auth-text">
        Don't have an account?
        <Link
          to="/register"
          style={{
            color: "rgb(72, 200, 160)",
            display: "inline-block",
            marginLeft: "5px",
            textDecoration: "none",
          }}>
          Register
        </Link>
      </p>
      <button type="submit">Submit login</button>
    </form>
  )
}
