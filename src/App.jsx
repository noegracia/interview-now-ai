import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react"
import config from "./config"; // Import the config file

function App() {
  const { user, systemPrompt, GPT_API_KEY } = config; // Destructure the user constant from the config
  const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
    "role": "system", "content": systemPrompt
  }

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
    await processMessageToGPT(newMessages);

  };

  async function processMessageToGPT(chatMessages) {
      
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

    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch("http://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GPT_API_KEY}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "GPT"
        }]
        );
        setTyping(false);
    });
  }

  return (
    <div className='App'>
      <div style={{position: "relative", height: "800px", width: "700px"}}>
        <MainContainer>
          <ChatContainer>
            <MessageList
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
