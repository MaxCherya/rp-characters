'use client';

import { Card, Field, Input, Button } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { PasswordInput } from "../ui/password-input";
import { RegistrationFormValues } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerUser } from "@/endpoints/auth";
import { toaster } from "../ui/toaster";

type Mode = "Login" | "Registration";

export default function RegistrationForm({ setMode,
}: { setMode: Dispatch<SetStateAction<Mode>> }) {
    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors, isSubmitting, isValid },
    } = useForm<RegistrationFormValues>({
        mode: "onChange",
        defaultValues: { username: "", email: "", password: "", password2: "" },
    });

    const passwordValue = watch("password");

    useEffect(() => {
        if (passwordValue) trigger("password2");
    }, [passwordValue, trigger]);

    // TANSTACK
    const { mutate, isPending, isSuccess, error } = useMutation({
        mutationFn: registerUser,
        onSuccess: async () => {
            toaster.create({
                description: 'Registration Completed.',
                type: 'success',
            })
            setMode('Login');
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Unknown error. Please try again.';
            toaster.create({
                description: msg,
                type: 'error',
            })
        },
    })

    const onSubmit = async (data: RegistrationFormValues) => {
        mutate(data);
    };

    return (
        <Card.Root maxW={{ base: "xl" }} w="full">
            <Card.Header>
                <Card.Title>Create account</Card.Title>
                <Card.Description>Sign up to start using RP Characters.</Card.Description>
            </Card.Header>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card.Body className="!space-y-2">
                    {/* USERNAME */}
                    <Field.Root invalid={!!errors.username}>
                        <Input
                            placeholder="Username"
                            disabled={isSubmitting}
                            aria-invalid={!!errors.username}
                            {...register("username", {
                                required: "Username is required",
                                minLength: { value: 3, message: "At least 3 characters" },
                                maxLength: { value: 32, message: "Max 32 characters" },
                            })}
                        />
                        {errors.username?.message && (
                            <Field.ErrorText>{errors.username.message}</Field.ErrorText>
                        )}
                    </Field.Root>

                    {/* EMAIL */}
                    <Field.Root invalid={!!errors.email}>
                        <Input
                            type="email"
                            placeholder="Email"
                            disabled={isSubmitting}
                            aria-invalid={!!errors.email}
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    // simple, pragmatic email check
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Enter a valid email",
                                },
                            })}
                        />
                        {errors.email?.message && (
                            <Field.ErrorText>{errors.email.message}</Field.ErrorText>
                        )}
                    </Field.Root>

                    {/* PASSWORD */}
                    <Field.Root invalid={!!errors.password}>
                        <PasswordInput
                            placeholder="Password"
                            disabled={isSubmitting}
                            aria-invalid={!!errors.password}
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 8, message: "At least 8 characters" },
                            })}
                        />
                        {errors.password?.message && (
                            <Field.ErrorText>{errors.password.message}</Field.ErrorText>
                        )}
                    </Field.Root>

                    {/* CONFIRM PASSWORD */}
                    <Field.Root invalid={!!errors.password2}>
                        <PasswordInput
                            placeholder="Re-enter your password"
                            disabled={isSubmitting}
                            aria-invalid={!!errors.password2}
                            {...register("password2", {
                                required: "Please confirm your password",
                                validate: (v, formValues) =>
                                    v === formValues.password || "Passwords do not match",
                            })}
                        />
                        {errors.password2?.message && (
                            <Field.ErrorText>{errors.password2.message}</Field.ErrorText>
                        )}
                    </Field.Root>
                </Card.Body>

                <Card.Footer>
                    <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={!isValid || isSubmitting}
                        w="full"
                    >
                        Create account
                    </Button>
                </Card.Footer>
            </form>
        </Card.Root>
    );
}