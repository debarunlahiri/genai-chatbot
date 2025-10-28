import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Chat } from '@google/genai';

import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { RunIcon } from './icons/RunIcon';
import { WrapIcon } from './icons/WrapIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';

interface CodeBlockProps {
    node?: any;
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    chat: Chat | null;
}

const ToolbarButton: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void; disabled?: boolean }> = ({ icon, text, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50">
        {icon}
        <span>{text}</span>
    </button>
);

export const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children, chat }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isWrapped, setIsWrapped] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState('');
    const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);

    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const codeString = String(children).replace(/\n$/, '');

    // HEURISTIC: Treat single-line, non-languaged code blocks as inline code.
    // This prevents things like `[]` or `def` from becoming large, separate code blocks.
    const isEffectivelyInline = inline || (!match && !codeString.includes('\n'));

    if (isEffectivelyInline) {
        return <code className="bg-slate-700 text-pink-400 rounded px-1.5 py-0.5 font-mono text-sm whitespace-pre-wrap break-words">{codeString}</code>;
    }

    const handleCopy = (content: string, setter: (isCopied: boolean) => void) => {
        navigator.clipboard.writeText(content).then(() => {
            setter(true);
            setTimeout(() => setter(false), 2000);
        });
    };

    const handleRun = async () => {
        if (!chat || isRunning || language !== 'python') return;

        setIsRunning(true);
        setOutput('');
        setIsOutputCollapsed(false);

        const runnerPrompt = `You are a code execution engine. Run the following python code and return ONLY the raw text output. Do not add any explanation, formatting, or backticks.\n\n---\n\n${codeString}`;
        
        try {
            const result = await chat.sendMessageStream({ message: runnerPrompt });
            for await (const chunk of result) {
                setOutput(prev => prev + chunk.text);
            }
        } catch (e) {
            console.error(e);
            setOutput("An error occurred while running the code.");
        } finally {
            setIsRunning(false);
        }
    };
    
    const syntaxHighlighterStyle = {
        ...vscDarkPlus,
        'pre[class*="language-"]': {
            ...vscDarkPlus['pre[class*="language-"]'],
            backgroundColor: '#111827', // gray-900
            margin: '0',
            padding: '1rem',
            borderRadius: '0',
            whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
            wordBreak: isWrapped ? 'break-all' : 'normal',
            fontSize: '0.875rem',
        },
    };
    
    return (
        <div className="bg-[#0d1117] border border-slate-700 rounded-lg my-4">
            <div className="flex items-center justify-between bg-[#161b22] text-xs text-slate-400 px-4 py-2 rounded-t-lg">
                <span className="font-mono">{language}</span>
                <div className="flex items-center gap-4">
                    <ToolbarButton icon={isCollapsed ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />} text={isCollapsed ? "Expand" : "Collapse"} onClick={() => setIsCollapsed(!isCollapsed)} />
                    <ToolbarButton icon={<WrapIcon className="w-4 h-4" />} text={isWrapped ? "Unwrap" : "Wrap"} onClick={() => setIsWrapped(!isWrapped)} />
                    {language === 'python' && (
                       <ToolbarButton icon={<RunIcon className="w-4 h-4" />} text={isRunning ? "Running..." : "Run"} onClick={handleRun} disabled={isRunning} />
                    )}
                    <ToolbarButton icon={isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />} text={isCopied ? "Copied" : "Copy"} onClick={() => handleCopy(codeString, setIsCopied)} />
                </div>
            </div>
            {!isCollapsed && (
                <SyntaxHighlighter
                    style={syntaxHighlighterStyle}
                    language={language}
                    PreTag="div"
                >
                    {codeString}
                </SyntaxHighlighter>
            )}

            {output && (
                <div className="border-t border-slate-700">
                     <div className="flex items-center justify-between bg-[#161b22] text-xs text-slate-400 px-4 py-2">
                        <span>output</span>
                        <div className="flex items-center gap-4">
                           <ToolbarButton icon={isOutputCollapsed ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />} text={isOutputCollapsed ? "Expand" : "Collapse"} onClick={() => setIsOutputCollapsed(!isOutputCollapsed)} />
                           <ToolbarButton icon={<CopyIcon className="w-4 h-4" />} text={"Copy"} onClick={() => handleCopy(output, () => {})} />
                        </div>
                    </div>
                    {!isOutputCollapsed && (
                        <pre className="bg-[#0d1117] p-4 text-sm text-slate-300 whitespace-pre-wrap break-all font-mono">
                            <code>{output}</code>
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
};