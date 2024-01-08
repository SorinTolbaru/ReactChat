export default function ChatMessages({
  messages,
  inputValue,
  talkingTo,
  sendMessage,
  setInputValue,
  status,
  deleteMessages,
  showPop,
  setShowPop,
  checkUserTyping,
  isTyping,
}) {
  function toggleTyping(e) {
    setInputValue(e.target.value)
    checkUserTyping(localStorage.getItem("talking-to"))
  }

  return (
    <form
      onSubmit={(e) => {
        sendMessage(e)
      }}
      className="chat-messages">
      {talkingTo && (
        <>
          <div className="talking-to">
            <h2 style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {talkingTo} <div className={status}></div> {isTyping}
            </h2>
          </div>

          <ul className="messages">{messages}</ul>
          <div className="send-message">
            <input
              type="text"
              name="msg"
              value={inputValue}
              onChange={(e) => toggleTyping(e)}
            />
            <button className="send-message-button">Send</button>
          </div>
        </>
      )}
    </form>
  )
}
