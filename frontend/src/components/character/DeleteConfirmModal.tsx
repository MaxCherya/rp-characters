'use client';

import { useEffect } from "react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    fullName: string;
    confirmationText: string;
    setConfirmationText: (value: string) => void;
    onConfirm: () => void;
    isProcessing: boolean;
    isConfirmationValid: boolean;
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    fullName,
    confirmationText,
    setConfirmationText,
    onConfirm,
    isProcessing,
    isConfirmationValid,
}: DeleteConfirmModalProps) {

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isProcessing) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-6 relative">
                <h2 className="text-xl font-bold mb-4">Confirm Deletion of Record</h2>

                <p className="mb-2 text-gray-700">You are about to permanently delete the following character record:</p>

                <p className="font-semibold text-lg mb-4">{fullName}</p>

                <p className="text-gray-700 mb-4">To verify this action, please type the full name exactly as it appears above.</p>

                <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-gray-800"
                    placeholder="Enter full name..."
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    disabled={isProcessing}
                />

                <p className="mt-2 text-xs text-gray-500">This operation is irreversible. Once deleted, the record cannot be restored.</p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                        onClick={onConfirm}
                        disabled={!isConfirmationValid || isProcessing}
                    >
                        {isProcessing ? "Deleting..." : "Delete Record"}
                    </button>
                </div>
            </div>
        </div>
    );
}