import { io } from "socket.io-client";
import { useRef } from "react";


function App() {
  const socket = useRef();
  socket.current = io(`http://${window.location.hostname}:5000`);
  return (
    <div className="App">
        <div>works</div>
    </div>
  );
}

export default App;
