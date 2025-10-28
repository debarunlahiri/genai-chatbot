import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Chat } from '@google/genai';

import { ChatMessage } from '../types';
import { GeminiIcon } from './icons/GeminiIcon';
import { UserIcon } from './icons/UserIcon';
import { CodeBlock } from './CodeBlock';
import { LightbulbIcon } from './icons/LightbulbIcon';

interface MessageProps {
    message: ChatMessage;
    isStreaming?: boolean;
    chat: Chat | null;
}

export const Message: React.FC<MessageProps> = ({ message, isStreaming, chat }) => {
    const isModel = message.role === 'model';

    const containerClasses = `flex items-start gap-4 w-full`;
    const messageClasses = isModel
        ? 'flex-row'
        : 'flex-row-reverse';

    return (
        <div className={`${containerClasses} ${messageClasses}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-purple-600' : 'bg-blue-600'}`}>
                {isModel ? <GeminiIcon className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-white" />}
            </div>
            <div className={`flex-1 max-w-[80%]`}>
                {isModel && message.content && (
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <LightbulbIcon className="w-4 h-4" />
                        <span>Thought for {Math.floor(Math.random() * 4) + 2}s</span>
                    </div>
                )}
                <div className="prose prose-invert prose-sm max-w-none break-words prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-blue-400 prose-a:hover:underline">
                    {isModel ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code: (props) => <CodeBlock {...props} chat={chat} />,
                                pre: ({ node, children, ...props }) => {
                                    const codeNode = node.children[0];
                                    if (codeNode && codeNode.tagName === 'code') {
                                        const className = codeNode.properties.className || [];
                                        const codeString = codeNode.children[0]?.value || '';
                                        const match = /language-(\w+)/.exec(className[0] || '');

                                        if (!match && !codeString.includes('\n')) {
                                            // This is an "effectively inline" code block.
                                            // By rendering the children in a fragment, we remove the <pre> wrapper.
                                            // react-markdown will then likely wrap this in a <p>, which is what we want.
                                            return <>{children}</>;
                                        }
                                    }
                                    // For all other code blocks, render them in a <pre> as normal.
                                    return <pre {...props}>{children}</pre>;
                                }
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    ) : (
                        <div className="bg-blue-600 p-4 rounded-xl">
                            <p className="font-bold mb-2 text-slate-200">You</p>
                            <p className="text-white whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                    )}
                    {isStreaming && isModel && <span className="inline-block w-2 h-4 bg-slate-300 animate-pulse ml-1" />}
                </div>
            </div>
        </div>
    );
};
