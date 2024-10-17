'use client'

import React from 'react';
import { ChatLayout } from "@/components/chat/chat-layout";

function App() {
    return (
        <div className="App">
            <main className="flex flex-col items-center min-h-screen p-4">
                <header className='w-full max-w-[90vw] flex justify-between items-center p-4 mb-8'>
                </header>
                <div className="flex z-10 max-w-[90vw] w-full h-[800px] mb-8 gap-8">
                    <div className="flex-1 border rounded-lg shadow-lg">
                        <ChatLayout
                            navCollapsedSize={12}
                            className="p-4"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
