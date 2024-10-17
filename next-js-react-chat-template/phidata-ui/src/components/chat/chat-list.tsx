import React, { useEffect, useRef } from "react";
import { Message } from "@/app/data";
import { Avatar, AvatarImage } from "../ui/avatar";
import ChatBottombar from "./chat-bottombar";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';

interface ChatListProps {
    messages?: Message[];
    sendMessage: (newMessage: Message) => void;
    isMobile: boolean;
}

function parseMessage(message: string): string {
    try {
        const parsed = JSON.parse(message);
        return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    } catch (e) {
        if (message.startsWith('"') && message.endsWith('"')) {
            return message.slice(1, -1).replace(/\\n/g, '\n').replace(/\\/g, '');
        }
        return message;
    }
}

export function ChatList({
    messages,
    sendMessage,
    isMobile,
}: ChatListProps) {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
            <div ref={messagesContainerRef} className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
                <AnimatePresence>
                    {messages?.map((message, index) => (
                        <motion.div
                            key={message.id || index}
                            layout
                            initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                            transition={{
                                opacity: { duration: 0.1 },
                                layout: {
                                    type: "spring",
                                    bounce: 0.3,
                                    duration: messages.indexOf(message) * 0.05 + 0.2,
                                },
                            }}
                            className="flex flex-col gap-2 p-4 whitespace-pre-wrap w-full"
                        >
                            <div className="flex gap-3 items-center justify-start w-full">
                                <Avatar className="flex justify-center items-center">
                                    <AvatarImage src={message.avatar} alt={message.name} width={6} height={6} />
                                </Avatar>
                                <span className={`p-3 rounded-md max-w-full flex-grow ${
                                    message.name === 'Jane Doe' ? 'bg-blue-50' : 'bg-accent'
                                }`}>
                                <ReactMarkdown
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-2" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-2" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                }}
                                >
                                {parseMessage(message.message)}
                                </ReactMarkdown>
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <ChatBottombar sendMessage={sendMessage} isMobile={isMobile} />
        </div>
    );
}