"use client";

import { useEffect, useState } from "react";

type DeleteEventModalProps = {
    isOpen: boolean;
    onClose: () => void;
    eventTitle: string | null;
    onConfirm: () => void;
    isProcessing?: boolean;
};

export const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
    isOpen,
    onClose,
    eventTitle,
    onConfirm,
    isProcessing = false,
}) => {
    const [confirmationText, setConfirmationText] = useState("");

    // reset when opened/closed or title changes
    useEffect(() => {
        if (isOpen) {
            setConfirmationText("");
        }
    }, [isOpen, eventTitle]);

    // body scroll lock
    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    if (!isOpen || !eventTitle) return null;

    const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
    const isMatch =
        confirmationText.trim().length > 0 &&
        normalize(confirmationText) === normalize(eventTitle);

    const handleClose = () => {
        if (isProcessing) return;
        setConfirmationText("");
        onClose();
    };

    const handleConfirm = () => {
        if (!isMatch || isProcessing) return;
        onConfirm();
    };

    const stopPropagation: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 p-6"
                onClick={stopPropagation}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-red-600">
                        Delete Event
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                    <p>
                        You are about to permanently delete the event{" "}
                        <span className="font-semibold">
                            &quot;{eventTitle}&quot;
                        </span>
                        . This cannot be undone.
                    </p>
                    <p>To confirm, please type the event title exactly:</p>
                </div>

                <div className="mt-4">
                    <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder={eventTitle}
                        disabled={isProcessing}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    {!isMatch && confirmationText.length > 0 && (
                        <p className="mt-1 text-xs text-red-500">
                            Title does not match.
                        </p>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!isMatch || isProcessing}
                        className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                        {isProcessing ? "Deleting..." : "Delete event"}
                    </button>
                </div>
            </div>
        </div>
    );
};