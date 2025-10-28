import React from 'react';

export const GeminiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M5.1119,12.2353a6.8881,6.8881,0,0,1,6.8881-6.8881V0A12,12,0,0,0,0,12,11.8543,11.8543,0,0,0,5.1119,21.7647V17.1119A6.8524,6.8524,0,0,1,5.1119,12.2353Z" fill="url(#gemini-gradient-1)" />
        <path d="M12,5.3472a6.8881,6.8881,0,0,1,6.8881,6.8881h4.6528A11.957,11.957,0,0,0,12,0Z" fill="#69a4f2" />
        <path d="M18.8881,11.7647A6.8881,6.8881,0,0,1,12,18.6528v4.6528A11.957,11.957,0,0,0,23.5409,12Z" fill="#8466f3" />
        <defs>
            <linearGradient id="gemini-gradient-1" x1="0" y1="12" x2="5.1119" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#69a4f2" />
                <stop offset="1" stopColor="#8466f3" />
            </linearGradient>
        </defs>
    </svg>
);