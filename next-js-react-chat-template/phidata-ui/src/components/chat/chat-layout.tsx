"use client";

import { userData } from "@/app/data";
import React, { useEffect, useState } from "react";
import { Chat } from "./chat";

interface ChatLayoutProps {
    navCollapsedSize: number;
    className?: string;
    defaultCollapsed?: boolean;
}
  
export function ChatLayout({}: ChatLayoutProps) {
    const [selectedUser] = React.useState(userData[0]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenWidth = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // Initial check
        checkScreenWidth();

        // Event listener for screen width changes
        window.addEventListener("resize", checkScreenWidth);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("resize", checkScreenWidth);
        };
    }, []);

    return (
            <Chat
                messages={selectedUser.messages}
                isMobile={isMobile}
            />
    );
}
