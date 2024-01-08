import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function UserList ({ users,getMessages,allUsers,disconnectUser,newMessageUsers}){

  useEffect(() => {
    setUserListItems(
      users.map((user) => (
        <li key={uuidv4()} onClick={()=>{getMessages(user);checkWidth()}} className={newMessageUsers.includes(user) ? "new-message": null }>
          {user}
        </li>
      ))
    );
  }, [users,newMessageUsers,getMessages]);

const [toggleChatList,setToggleChatList] = useState(true)


const [userListItems,setUserListItems] = useState(users.map((user) => (
  <li key={uuidv4()} onClick={()=>{getMessages(user);checkWidth()}}>
    {user}
  </li>
)))

 function usersToLi(foundUsers){
  setUserListItems(foundUsers.map((user) => (
    <li key={uuidv4()} onClick={()=>getMessages(user)}>
      {user}
    </li>
  )))
 }

  function searchPeople(text){
    if(text.length !== 0){
      usersToLi(allUsers.filter((u)=>u.toLowerCase().includes(text.toLowerCase())));
    }else{
      usersToLi(users)
    }
  }

  function checkWidth(){
    if(window.innerWidth <= 1024){
      setToggleChatList(false)
    }
  }


  return (
    <div className="chat-list" id={toggleChatList ? null : "chat-list-hide"} >
      <button type='button' className='chat-list-toggle' onClick={()=>setToggleChatList(!toggleChatList)}>
        {toggleChatList ? "Hide" : "Show"}
      </button>
      <div style={toggleChatList ? null : { display: 'none' }}>
      <div className="contacts">
      <h2>Contacts</h2>
      <input type="text" onChange={(e)=>{searchPeople(e.target.value)}} placeholder='Search for people'/>
      <ul>{userListItems}</ul>
      </div>
      <div className="user-profile">
      <h2>{localStorage.getItem("username")}</h2>
      <div className="settings-container">
        <button onClick={()=>{disconnectUser()}}>Disconnect</button>
      </div>
      </div>
      </div>
    </div>
  );
};


