"use client";

import React from "react";

export const FullScreenLoader: React.FC<{
    text?: string;
}> = ({ text }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900 overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 h-80 w-80 animate-ping-slow rounded-full bg-blue-400/20 blur-3xl"></div>
                <div className="absolute -bottom-40 -right-40 h-96 w-96 animate-ping-slow animation-delay-2000 rounded-full bg-purple-400/20 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-ping-slow animation-delay-4000 rounded-full bg-pink-400/10 blur-3xl"></div>
            </div>

            {/* Main Loader */}
            <div className="relative">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 -m-4 animate-spin-slow rounded-full border-t-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-[length:400%_400%] opacity-20"></div>

                {/* Inner pulsing orb */}
                <div className="relative h-24 w-24 animate-pulse-slow rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1 shadow-2xl">
                    <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                        {/* Core glowing dot */}
                        <div className="h-12 w-12 animate-ping rounded-full bg-white/80 shadow-lg"></div>
                    </div>
                </div>

                {/* Orbiting dots */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-orbit"
                        style={{
                            animationDelay: `${i * 0.2}s`,
                            animationDuration: "3s",
                        }}
                    >
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"></div>
                    </div>
                ))}
            </div>

            {/* Optional subtle text */}
            {text && (
                <p className="absolute bottom-16 text-lg font-light tracking-wider text-gray-600 dark:text-gray-400 animate-fade-in">
                    {text}
                </p>
            )}
        </div>
    );
};