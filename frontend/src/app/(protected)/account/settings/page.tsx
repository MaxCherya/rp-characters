"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Card,
    Text,
    HStack,
    VStack,
    Spinner,
} from "@chakra-ui/react";
import QRCode from "react-qr-code";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { fetchTwoFAStatus, toggleTwoFA } from "@/endpoints/auth";
import { toaster } from "@/components/ui/toaster";
import type { TwoFAStatus } from "@/types/auth";

export default function Settings() {
    const queryClient = useQueryClient();
    const { data: user } = useCurrentUser();

    const {
        data: twoFAStatus,
        isLoading,
        isError,
        error,
    } = useQuery<TwoFAStatus>({
        queryKey: ["twofa"],
        queryFn: fetchTwoFAStatus,
    });

    // Local state
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [showOtpRow, setShowOtpRow] = useState(false);
    const [targetEnable, setTargetEnable] = useState<boolean | null>(null);
    const [otpCode, setOtpCode] = useState("");
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

    // Keep local `is2FAEnabled` in sync with backend
    useEffect(() => {
        if (twoFAStatus) {
            setIs2FAEnabled(twoFAStatus.is_enabled);
        }
    }, [twoFAStatus]);

    const toggleMutation = useMutation({
        mutationFn: toggleTwoFA,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["twofa"] });
            queryClient.invalidateQueries({ queryKey: ["me"] });

            setIs2FAEnabled(data.is_enabled);
            setShowOtpRow(false);
            setTargetEnable(null);
            setOtpCode("");
            setIs2FAModalOpen(false);

            toaster.create({
                description: data.is_enabled
                    ? "Two-factor authentication has been enabled."
                    : "Two-factor authentication has been disabled.",
                type: "success",
            });
        },
        onError: (err: any) => {
            const msg =
                err instanceof Error ? err.message : "Failed to update 2FA settings.";
            toaster.create({ description: msg, type: "error" });
        },
    });

    // lock body scroll when modal is open
    useEffect(() => {
        if (!is2FAModalOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [is2FAModalOpen]);

    // CLICK ON TOGGLE → open modal to enable/disable
    const handleToggleClick = () => {
        if (!twoFAStatus || toggleMutation.isPending) return;

        const desired = !is2FAEnabled; // inverse of current state
        setTargetEnable(desired);
        setShowOtpRow(true);
        setOtpCode("");
        setIs2FAModalOpen(true);
    };

    const handleConfirm = () => {
        if (!otpCode.trim() || targetEnable === null) {
            toaster.create({
                description: "Please enter your 2FA code.",
                type: "error",
            });
            return;
        }

        toggleMutation.mutate({
            enable: targetEnable,
            otp_code: otpCode.trim(),
        });
    };

    const handleCancel = () => {
        if (toggleMutation.isPending) return;
        setShowOtpRow(false);
        setTargetEnable(null);
        setOtpCode("");
        setIs2FAModalOpen(false);
    };

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <Spinner size="lg" />
            </main>
        );
    }

    if (isError || !twoFAStatus) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <Text color="red.500">
                    {(error as any)?.message || "Failed to load settings."}
                </Text>
            </main>
        );
    }

    const modalTitle = targetEnable
        ? "Enable Two-Factor Authentication"
        : "Disable Two-Factor Authentication";
    const modalDescription = targetEnable
        ? "Secure your account with an authenticator app."
        : "You’re about to turn off 2FA for your account.";

    const handleModalBackgroundClick = () => {
        handleCancel();
    };

    const stopModalPropagation = (e: any) => {
        e.stopPropagation();
    };

    return (
        <main className="min-h-screen flex justify-center px-4 py-8 bg-gray-100">
            <Box className="w-full max-w-3xl">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Account Settings</Card.Title>
                        <Card.Description>
                            Manage security options for{" "}
                            <strong>{user?.username ?? "your account"}</strong>.
                        </Card.Description>
                    </Card.Header>

                    <Card.Body className="space-y-8">
                        {/* 2FA block */}
                        <Box>
                            <HStack justify="space-between" mb={2}>
                                <VStack align="start" gap={0}>
                                    <Text fontWeight="semibold">
                                        Two-Factor Authentication
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Add an extra layer of security using a TOTP authenticator
                                        app.
                                    </Text>
                                </VStack>

                                <HStack gap={3}>
                                    <Text fontSize="sm" color="gray.700">
                                        {is2FAEnabled ? "Enabled" : "Disabled"}
                                    </Text>

                                    {/* CUSTOM TAILWIND TOGGLE */}
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={is2FAEnabled}
                                        onClick={handleToggleClick}
                                        disabled={toggleMutation.isPending}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition
                                            ${is2FAEnabled
                                                ? "bg-blue-600 border-blue-600"
                                                : "bg-gray-300 border-gray-300"
                                            }
                                            ${toggleMutation.isPending
                                                ? "opacity-60 cursor-not-allowed"
                                                : "cursor-pointer"
                                            }
                                        `}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition
                                                ${is2FAEnabled ? "translate-x-5" : "translate-x-1"}
                                            `}
                                        />
                                    </button>
                                </HStack>
                            </HStack>

                            <Text fontSize="xs" color="gray.500" mt={2}>
                                Use an authenticator app like Google Authenticator, 1Password,
                                or Authy. You&apos;ll be asked for a 6-digit code on login.
                            </Text>
                        </Box>
                    </Card.Body>
                </Card.Root>
            </Box>

            {/* Tailwind modal for 2FA setup/confirm */}
            {is2FAModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={handleModalBackgroundClick}
                >
                    <div
                        className="w-full max-w-4xl rounded-xl bg-white shadow-xl border border-gray-200 p-6"
                        onClick={stopModalPropagation}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">{modalTitle}</h2>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={toggleMutation.isPending}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{modalDescription}</p>

                        <div className="space-y-4">
                            {/* QR setup when enabling and currently disabled */}
                            {targetEnable &&
                                !is2FAEnabled &&
                                twoFAStatus.otpauth_url &&
                                twoFAStatus.secret && (
                                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
                                        <p className="text-sm font-medium text-gray-800">
                                            Set up your authenticator app
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            1. Scan this QR code with Google Authenticator,
                                            1Password, Authy, or another TOTP app.
                                        </p>

                                        <div className="flex justify-center">
                                            <div className="border border-gray-200 bg-white p-3 rounded-md">
                                                <QRCode value={twoFAStatus.otpauth_url} />
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-700">
                                            2. Or enter this secret manually:{" "}
                                            <code className="px-1 py-0.5 rounded bg-gray-100 text-xs">
                                                {twoFAStatus.secret}
                                            </code>
                                        </p>

                                        <p className="text-sm text-gray-700">
                                            3. Enter the 6-digit code from your app below to
                                            confirm.
                                        </p>
                                    </div>
                                )}

                            {/* OTP input */}
                            {showOtpRow && (
                                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
                                    <p className="text-sm text-gray-700">
                                        Enter the 6-digit code from your authenticator app to{" "}
                                        {targetEnable ? "enable" : "disable"} 2FA.
                                    </p>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-gray-700">
                                            2FA code
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="123456"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            inputMode="numeric"
                                            maxLength={6}
                                            disabled={toggleMutation.isPending}
                                            className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Footer buttons */}
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={toggleMutation.isPending}
                                    className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={toggleMutation.isPending}
                                    className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                                >
                                    {toggleMutation.isPending
                                        ? targetEnable
                                            ? "Enabling..."
                                            : "Disabling..."
                                        : targetEnable
                                            ? "Enable 2FA"
                                            : "Disable 2FA"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}