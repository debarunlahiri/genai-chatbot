import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './icons/SendIcon';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-slate-950/80 backdrop-blur-sm p-4 border-t border-slate-800">
            <div className="relative max-w-4xl mx-auto">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Gemini..."
                    rows={1}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-full py-3 px-6 pr-16 resize-none focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 disabled:opacity-50 transition-all duration-200"
                    disabled={isLoading}
                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-colors disabled:cursor-not-allowed text-white bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500"
                    aria-label="Send message"
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};
