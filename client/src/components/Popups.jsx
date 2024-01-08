import React from "react"

export default function DeleteMessagesPOP({
  showPop,
  deleteMessages,
  talkingTo,
  setShowPop,
}) {
  return (
    showPop && (
      <>
        <div className="delete-messages">
          <h1>Are you sure you want to delete this conversation?</h1>
          <button type="button" onClick={() => deleteMessages(talkingTo)}>
            Yes
          </button>
          <button type="button" onClick={() => setShowPop(!showPop)}>
            No
          </button>
        </div>
      </>
    )
  )
}
