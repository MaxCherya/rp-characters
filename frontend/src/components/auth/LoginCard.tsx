'use client';

import { Card, Field, Input, Button } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { PasswordInput } from "../ui/password-input";
import { LoginFormValues } from "@/types/auth";
import { fetchCurrentUser, loginUser } from "@/endpoints/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toaster } from "../ui/toaster";

export default function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<LoginFormValues>({
        mode: "onChange",
        defaultValues: { username: "", password: "" },
    });

    const router = useRouter();
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({ mutationFn: loginUser });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await mutateAsync(data);
            await queryClient.invalidateQueries({ queryKey: ["me"] });
            await queryClient.prefetchQuery({ queryKey: ["me"], queryFn: fetchCurrentUser });
            router.push("/menu");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error. Please try again.";
            toaster.create({ description: msg, type: "error" });
        }
    };

    return (
        <Card.Root maxW={{ base: '90%', lg: "xl" }} w="full">
            <Card.Header>
                <Card.Title>Login</Card.Title>
                <Card.Description>Enter credentials to access your account.</Card.Description>
            </Card.Header>

            <form action={undefined} onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit(onSubmit)(e);
            }}>
                <Card.Body className="!space-y-2">
                    {/* USERNAME */}
                    <Field.Root invalid={!!errors.username}>
                        <Input
                            placeholder="Username"
                            disabled={isSubmitting}
                            aria-invalid={!!errors.username}
                            {...register("username", {
                                required: "Username is required",
                            })}
                        />
                        {errors.username?.message && (
                            <Field.ErrorText>{errors.username.message}</Field.ErrorText>
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
                            })}
                        />
                        {errors.password?.message && (
                            <Field.ErrorText>{errors.password.message}</Field.ErrorText>
                        )}
                    </Field.Root>
                </Card.Body>

                <Card.Footer>
                    <Button
                        type="submit"
                        loading={isPending}
                        disabled={!isValid || isPending}
                        onClick={handleSubmit(onSubmit)}
                        w="full"
                    >
                        Sign in
                    </Button>
                </Card.Footer>
            </form>
        </Card.Root>
    );
}