import { Message } from "@/app/data";
import { ChatList } from "./chat-list";
import React from "react";

interface ChatProps {
  messages?: Message[];
  isMobile: boolean;
}

export function Chat({ 
  messages,
  isMobile,  
}: ChatProps) {
  const [messagesState, setMessages] = React.useState<Message[]>(
    messages ?? []
  );

  const sendMessage = (newMessage: Message) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
};

  return (
    <div className="flex flex-col justify-between w-full h-full">
    <ChatList
        messages={messagesState}
        sendMessage={sendMessage}
        isMobile={isMobile}
      />
    </div>
  );
}
