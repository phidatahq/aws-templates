import {
    Mic,
} from "lucide-react";
import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Message, loggedInUserData, userData } from "@/app/data";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { testInitiate, testStatus } from "@/utils/api";
import ExpandableTextarea from "./expandable-textarea";
import { v4 as uuidv4 } from 'uuid';

interface ChatBottombarProps {
    sendMessage: (newMessage: Message) => void;
    isMobile: boolean;
}

const useSessionId = () => {
    const [sessionId, setSessionId] = useState<string>('');
  
    useEffect(() => {
      setSessionId(uuidv4());
    }, []);
  
    return sessionId;
};   

export default function ChatBottombar({
    sendMessage, isMobile,
}: ChatBottombarProps) {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const sessionId = useSessionId();

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    };

    const handleSend = async () => {
        if (message.trim()) {
            setIsLoading(true);
    
            const trimmedMessage = message.trim();
            const newMessage: Message = {
                id: trimmedMessage.length + 1,
                name: loggedInUserData.name,
                avatar: loggedInUserData.avatar,
                message: trimmedMessage,
            };
    
            sendMessage(newMessage);
            setMessage("");
    
            if (inputRef.current) {
                inputRef.current.focus();
            }
    
            try {
                await handleLongRunningProcess(trimmedMessage, sessionId);
            } catch (error) {
                console.error("Error during API calls:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    async function handleLongRunningProcess(question: string, sessionId: string): Promise<void> {
        const processId = await testInitiate(question, sessionId);
        if (processId) {
            const result = await testStatus(processId);
            if (result) {
                sendResponseMessage(result, processId);
            }
        }
    }

    function sendResponseMessage(response: string, processId?: string) {
        const responseMessage: Message = {
            id: userData[0].messages.length + 1,
            name: userData[0].name,
            avatar: userData[0].avatar,
            message: response,
            processId,
        };
        userData[0].messages.push(responseMessage);
        sendMessage(responseMessage);
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }

        if (event.key === "Enter" && event.shiftKey) {
            event.preventDefault();
            setMessage((prev) => prev + "\n");
        }
    };

    return (
        <div className="pl-6 pr-8 py-2 flex justify-between w-full items-center gap-2 border border-gray-200 rounded-lg">
            <div className="flex">
                <Popover>
                    <PopoverTrigger asChild>
                        <Link
                            href="#"
                            className={cn(
                                buttonVariants({ variant: "ghost", size: "icon" }),
                                "h-9 w-9",
                                "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                            )}
                        >
                        </Link>
                    </PopoverTrigger>
                    <PopoverContent
                        side="top"
                        className="w-full p-2">
                        {message.trim() || isMobile ? (
                            <div className="flex gap-2">
                                <Link
                                    href="#"
                                    className={cn(
                                        buttonVariants({ variant: "ghost", size: "icon" }),
                                        "h-9 w-9",
                                        "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                                    )}
                                >
                                    <Mic size={20} className="text-muted-foreground" />
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="#"
                                className={cn(
                                    buttonVariants({ variant: "ghost", size: "icon" }),
                                    "h-9 w-9",
                                    "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                                )}
                            >
                                <Mic size={20} className="text-muted-foreground" />
                            </Link>
                        )}
                    </PopoverContent>
                </Popover>
            </div>

            <AnimatePresence initial={false}>
                <motion.div
                    key="input"
                    className="w-full relative"
                    layout
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{
                        opacity: { duration: 0.05 },
                        layout: {
                            type: "spring",
                            bounce: 0.15,
                        },
                    }}
                >
                    <ExpandableTextarea
                    value={message}
                    onChange={handleInputChange}
                    onSend={handleSend}
                    placeholder="Type a message..."
                    isLoading={isLoading}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
