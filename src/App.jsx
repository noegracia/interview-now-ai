import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react"
import config from "./config"; // Import the config file
import TwitterIcon from '../icons/twitter.svg'; // import your social icons
import LinkedInIcon from '../icons/linkedin.svg';

function App() {
  const { user } = config; // Destructure the user constant from the config
  
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am Noé Gracia's LLM Agent! You can ask me any question about Noé. I will try my best to answer you!",
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
    try {
      const response = await fetch("http://localhost:3001/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(chatMessages)
      });
  
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit exceeded
          const errorData = await response.json();
          console.error("Rate limit error:", errorData.message);
          // Handle the rate limit message in your chatbot
          // For example, displaying it in the chat interface
          setMessages([
            ...chatMessages,
            {
              message: errorData.message, // Show the rate limit error message
              sender: "System"
            }
          ]);
        } else {
          // Handle other types of errors
          console.error("Error fetching data:", response.statusText);
        }
        setTyping(false);
        return;
      }
  
      // If the response is okay, process it
      const data = await response.json();
      const openaiMessage = data.openaiResponse.content;
      console.log(data);
      setMessages([
        ...chatMessages,
        {
          message: openaiMessage,
          sender: "GPT"
        }
      ]);
      setTyping(false);
    } catch (error) {
      console.error("Error in fetch operation:", error);
      // Handle network errors or other issues related to the fetch operation
      setTyping(false);
    }
  }
  

  return (
    <div className='App'>
      <header className="App-header">
        <img src="/noe_photo.png" alt="Profile" className="Profile-photo"/>
        
        <div className="Profile-name"><h1>Noé Gracia</h1></div>
      </header>
      <main className="App-main">
        <section className="Chat-section">
          {/* Your chatbot code here */}
          <div style={{position: "relative", height: "800px", width: "700px"}}>
            <MainContainer>
              <ChatContainer>
                <MessageList scrollBehavior='smooth' typingIndicator={typing ? <TypingIndicator content={`${user} is typing`} /> : null}>
                  {messages.map((message, index) => {
                    return <Message key={index} model={message} />
                  })}
                </MessageList>
                <MessageInput placeholder="Type message here" onSend={(message) => handleSend(message)} />
              </ChatContainer>
            </MainContainer>
          </div>
        </section>
      </main>
      <footer className="App-footer">
        <div className="Footer-socials">
          <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">
            <img src={TwitterIcon} alt="Twitter" className="Social-icon"/>
          </a>
          <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer">
            <img src={LinkedInIcon} alt="LinkedIn" className="Social-icon"/>
          </a>
        </div>
        <div className="Footer-credit">
          © Noé Gracia 2023
        </div>
        <div className="Footer-contact">
          <span>Say hello.</span>
          <a href="mailto:your.email@example.com">hello@noegracia.com</a>
        </div>
      </footer>

    </div>
  );
}

export default App
