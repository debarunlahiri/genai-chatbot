import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";

import { ChatMessage } from './types';
import { Message } from './components/Message';
import { ChatInput } from './components/ChatInput';
import { GeminiIcon } from './components/icons/GeminiIcon';

const WelcomeScreen = ({ onPromptClick }: { onPromptClick: (prompt: string) => void }) => {
    const examplePrompts = [
        "Explain quantum computing in simple terms",
        "Give me a 3-day itinerary for a trip to Paris",
        "Write a short story about a robot who discovers music",
    ];
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 mb-4">
                <GeminiIcon className="w-full h-full" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100 mb-2">Hello, I'm Helper</h1>
            <p className="text-lg text-slate-400 mb-8">How can I help you today?</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
                {examplePrompts.map((prompt, i) => (
                    <button
                        key={i}
                        onClick={() => onPromptClick(prompt)}
                        className="bg-slate-800/80 p-4 rounded-lg text-left hover:bg-slate-700 transition-colors duration-200"
                    >
                        <p className="font-semibold text-slate-200">{prompt}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const chat = useMemo<Chat | null>(() => {
        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                console.error("API key is missing.");
                setMessages([{ role: 'model', content: "Configuration Error: The API key is missing. Please ensure it is correctly configured in your environment." }]);
                return null;
            }
            const ai = new GoogleGenAI({ apiKey });
            return ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are a helpful and friendly AI assistant. Format your responses using markdown where appropriate.',
                },
            });
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setMessages([{ role: 'model', content: `Failed to initialize the AI model. Error: ${errorMessage}` }]);
            return null;
        }
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSendMessage = async (userInput: string) => {
        if (!chat || isLoading) return;

        setIsLoading(true);

        const userMessage: ChatMessage = { role: 'user', content: userInput };
        setMessages(prevMessages => [...prevMessages, userMessage, { role: 'model', content: '' }]);

        try {
            const result = await chat.sendMessageStream({ message: userInput });
            
            let accumulatedText = "";
            for await (const chunk of result) {
                accumulatedText += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'model') {
                        lastMessage.content = accumulatedText;
                    }
                    return newMessages;
                });
            }

        } catch (e: any) {
            const errorMessage = "An error occurred while fetching the response. Please try again.";
            console.error(e);
            setMessages(prevMessages => {
                const newMessages = [...prevMessages];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.content = errorMessage;
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white">
            <header className="bg-slate-900/80 backdrop-blur-sm p-3 border-b border-slate-700 flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8">
                    <GeminiIcon className="w-full h-full" />
                </div>
                <h1 className="text-xl font-semibold">Helper</h1>
            </header>
            
            {messages.length === 0 ? (
                <WelcomeScreen onPromptClick={handleSendMessage} />
            ) : (
                <main ref={chatContainerRef} className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                        {messages.map((msg, index) => (
                            <Message 
                                key={index} 
                                message={msg}
                                chat={chat}
                                isStreaming={isLoading && index === messages.length - 1 && msg.role === 'model'} 
                            />
                        ))}
                    </div>
                </main>
            )}

            <footer className="sticky bottom-0 z-10 flex-shrink-0">
                 <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </footer>
        </div>
    );
};

export default App;