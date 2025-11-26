'use client';

import { Card, Field, Input, Button } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { PasswordInput } from "../ui/password-input";
import { LoginFormValues } from "@/types/auth";
import { fetchCurrentUser, loginUser, LoginError } from "@/endpoints/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toaster } from "../ui/toaster";
import { useState } from "react";

export default function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        setError,
        clearErrors,
    } = useForm<LoginFormValues>({
        mode: "onChange",
        defaultValues: { username: "", password: "", otp_code: "" },
    });

    const router = useRouter();
    const queryClient = useQueryClient();

    // When true, we know the backend requires 2FA for this user
    const [needs2FA, setNeeds2FA] = useState(false);

    const { mutateAsync, isPending } = useMutation({ mutationFn: loginUser });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            // if backend already told us 2FA is required, ensure otp_code is present
            if (needs2FA && !data.otp_code?.trim()) {
                setError("otp_code", {
                    type: "required",
                    message: "2FA code is required",
                });
                return;
            }

            clearErrors("otp_code");

            await mutateAsync(data);

            // success → refresh "me" and redirect
            await queryClient.invalidateQueries({ queryKey: ["me"] });
            await queryClient.prefetchQuery({
                queryKey: ["me"],
                queryFn: fetchCurrentUser,
            });
            router.replace("/menu");
        } catch (err) {
            if (err instanceof LoginError && err.twoFARequired) {
                // Backend says 2FA is required for this account.
                setNeeds2FA(true);
                toaster.create({
                    description:
                        "Two-factor authentication is required. Please enter your 2FA code.",
                    type: "info",
                });
                return;
            }

            const msg =
                err instanceof Error
                    ? err.message
                    : "Unknown error. Please try again.";
            toaster.create({ description: msg, type: "error" });
        }
    };

    const submitting = isPending;

    return (
        <Card.Root maxW={{ base: "90%", lg: "xl" }} w="full">
            <Card.Header>
                <Card.Title>Login</Card.Title>
                <Card.Description>
                    Enter credentials to access your account.
                </Card.Description>
            </Card.Header>

            <form
                action={undefined}
                onSubmit={(e) => {
                    e.preventDefault();
                    void handleSubmit(onSubmit)(e);
                }}
            >
                <Card.Body className="!space-y-2">
                    {/* USERNAME */}
                    <Field.Root invalid={!!errors.username}>
                        <Input
                            placeholder="Username"
                            disabled={submitting}
                            aria-invalid={!!errors.username}
                            {...register("username", {
                                required: "Username is required",
                            })}
                        />
                        {errors.username?.message && (
                            <Field.ErrorText>
                                {errors.username.message}
                            </Field.ErrorText>
                        )}
                    </Field.Root>

                    {/* PASSWORD */}
                    <Field.Root invalid={!!errors.password}>
                        <PasswordInput
                            placeholder="Password"
                            disabled={submitting}
                            aria-invalid={!!errors.password}
                            {...register("password", {
                                required: "Password is required",
                            })}
                        />
                        {errors.password?.message && (
                            <Field.ErrorText>
                                {errors.password.message}
                            </Field.ErrorText>
                        )}
                    </Field.Root>

                    {/* 2FA CODE – only shown after backend says it's required */}
                    {needs2FA && (
                        <Field.Root invalid={!!errors.otp_code}>
                            <Input
                                placeholder="2FA code"
                                disabled={submitting}
                                aria-invalid={!!errors.otp_code}
                                inputMode="numeric"
                                {...register("otp_code")}
                            />
                            {errors.otp_code?.message && (
                                <Field.ErrorText>
                                    {errors.otp_code.message}
                                </Field.ErrorText>
                            )}
                        </Field.Root>
                    )}
                </Card.Body>

                <Card.Footer>
                    <Button
                        type="submit"
                        loading={submitting}
                        disabled={!isValid || submitting}
                        onClick={handleSubmit(onSubmit)}
                        w="full"
                    >
                        {needs2FA ? "Verify & sign in" : "Sign in"}
                    </Button>
                </Card.Footer>
            </form>
        </Card.Root>
    );
}