import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react"
import config from "./config"; // Import the config file

function App() {
  const { user } = config; // Destructure the user constant from the config
  
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT!",
      sender: "GPT"
    }
  ])

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage]; // all the old messages + the new message
    // update our messages state
    setMessages(newMessages);

    // set a typing indicator
    setTyping(true);

    // process message to chatGPT send it over and see the response
    await processMessageToAPI(newMessages);

  };

  async function processMessageToAPI(chatMessages) {
      
    // chatMessages { sender: "user" or "chatGPT", message: "The message content here"}
    // apiMessages { role: "user" or "assistant", content: "The message content here"}

      let apiMessages = chatMessages.map((messageObject) => {
        let role = "";
        if(messageObject.sender === "GPT") {
          role="assistant"
        } else {
          role="user"
        }
        return { role: role, content: messageObject.message }
    });


    // Send the request to the server
    await fetch("http://localhost:3001/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(apiMessages)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      const openaiMessage = data.openaiResponse;
      console.log(data);
      setMessages(
        [...chatMessages, {
          message: openaiMessage,
          sender: "GPT"
        }]
        );
        setTyping(false);
    }).catch((error) => {
      console.error("Error fetching data:", error);
      // Handle errors appropriately
    });
    
  }

  return (
    <div className='App'>
      <div style={{position: "relative", height: "800px", width: "700px"}}>
        <MainContainer>
          <ChatContainer>
            <MessageList
            scrollBehavior='smooth'
              typingIndicator={typing ? <TypingIndicator content={`${user} is typing`} /> : null}>
              {messages.map((message, index) => {
                return <Message key={index} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={(message) => handleSend(message)} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App
