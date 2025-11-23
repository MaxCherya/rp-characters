'use client';

import {
    Card,
    Heading,
    VStack,
    Input,
    Field,
    Button,
    Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CharacterFormValues, Character } from "@/types/characters";
import { createCharacter } from "@/endpoints/characters";
import { toaster } from "@/components/ui/toaster";
import { CountryOption } from "@/types/external";
import { fetchCountriesOptions } from "@/endpoints/external";

export default function CreateCharacter() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const {
        data: countries,
        isLoading: isCountriesLoading,
        isError: isCountriesError,
    } = useQuery<CountryOption[]>({
        queryKey: ["countries-options"],
        queryFn: fetchCountriesOptions,
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
        reset,
    } = useForm<CharacterFormValues>({
        mode: "onChange",
        defaultValues: {
            basic_identity: {
                name_given: "",
                name_family: "",
                name_middle: "",
                date_of_birth: "",
            },
            location: {
                country: "",
                state_province: "",
                zip_code: "",
                settlement: "",
                street: "",
                house: "",
                appartment: "",
            },
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationFn: createCharacter,
    });

    const onSubmit = async (data: CharacterFormValues) => {
        try {
            const created = await mutateAsync(data);

            queryClient.setQueryData<Character[] | undefined>(
                ["characters"],
                (old) => (old ? [...old, created] : [created])
            );

            await queryClient.invalidateQueries({ queryKey: ["characters"] });

            toaster.create({
                description: "Character created successfully.",
                type: "success",
            });

            reset();
            router.push("/my-characters");
        } catch (err) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Failed to create character. Please try again.";
            toaster.create({ description: msg, type: "error" });
        }
    };

    const isBusy = isSubmitting || isPending;

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-100">
            <Card.Root
                maxW="3xl"
                width="full"
                p={6}
                borderWidth="1px"
                borderRadius="md"
                bg="white"
            >
                <Card.Header>
                    <Heading size="lg">Create Character</Heading>
                    <Text fontSize="sm" color="gray.600">Fill out the basic information to create a new character.</Text>
                </Card.Header>

                <form
                    action={undefined}
                    onSubmit={(e) => {
                        e.preventDefault();
                        void handleSubmit(onSubmit)(e);
                    }}
                >
                    <Card.Body>
                        <VStack gap={4} align="stretch">
                            {/* BASIC IDENTITY */}
                            <Heading size="sm">Basic Identity</Heading>

                            <Field.Root invalid={!!errors.basic_identity?.name_given}>
                                <Input
                                    placeholder="Given name"
                                    disabled={isBusy}
                                    aria-invalid={!!errors.basic_identity?.name_given}
                                    {...register("basic_identity.name_given", {
                                        required: "Given name is required",
                                        minLength: {
                                            value: 2,
                                            message: "Given name must be at least 2 characters",
                                        },
                                    })}
                                />
                                {errors.basic_identity?.name_given?.message && (
                                    <Field.ErrorText>{errors.basic_identity.name_given.message}</Field.ErrorText>
                                )}
                            </Field.Root>

                            <Field.Root invalid={!!errors.basic_identity?.name_family}>
                                <Input
                                    placeholder="Family name"
                                    disabled={isBusy}
                                    aria-invalid={!!errors.basic_identity?.name_family}
                                    {...register("basic_identity.name_family", {
                                        required: "Family name is required",
                                        minLength: {
                                            value: 2,
                                            message: "Family name must be at least 2 characters",
                                        },
                                    })}
                                />
                                {errors.basic_identity?.name_family?.message && (
                                    <Field.ErrorText>{errors.basic_identity.name_family.message}</Field.ErrorText>
                                )}
                            </Field.Root>

                            <Field.Root>
                                <Input
                                    placeholder="Middle name (optional)"
                                    disabled={isBusy}
                                    {...register("basic_identity.name_middle")}
                                />
                            </Field.Root>

                            <Field.Root>
                                <Input
                                    type="date"
                                    placeholder="Date of birth"
                                    disabled={isBusy}
                                    {...register("basic_identity.date_of_birth")}
                                />
                            </Field.Root>

                            {/* LOCATION */}
                            <Heading size="sm" pt={2}>Location</Heading>

                            {/* COUNTRY DROPDOWN (native <select>) */}
                            <Field.Root invalid={!!errors.location?.country}>
                                <select
                                    {...register("location.country", {
                                        required: "Country is required",
                                    })}
                                    disabled={isBusy || isCountriesLoading || isCountriesError}
                                    aria-invalid={!!errors.location?.country}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                                >
                                    <option value="">
                                        {isCountriesLoading
                                            ? "Loading countries..."
                                            : isCountriesError
                                                ? "Failed to load countries"
                                                : "Select country"}
                                    </option>
                                    {countries?.map((c) => (
                                        <option key={c.code} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.location?.country?.message && (
                                    <Field.ErrorText>{errors.location.country.message}</Field.ErrorText>
                                )}
                            </Field.Root>

                            <Field.Root>
                                <Input
                                    placeholder="State / Province"
                                    disabled={isBusy}
                                    {...register("location.state_province")}
                                />
                            </Field.Root>

                            <Field.Root invalid={!!errors.location?.zip_code}>
                                <Input
                                    placeholder="ZIP Code"
                                    disabled={isBusy}
                                    aria-invalid={!!errors.location?.zip_code}
                                    {...register("location.zip_code", {
                                        minLength: {
                                            value: 3,
                                            message: "ZIP code must be at least 3 characters",
                                        },
                                    })}
                                />
                                {errors.location?.zip_code?.message && (
                                    <Field.ErrorText>{errors.location.zip_code.message}</Field.ErrorText>
                                )}
                            </Field.Root>

                            <Field.Root invalid={!!errors.location?.settlement}>
                                <Input
                                    placeholder="City / Settlement"
                                    disabled={isBusy}
                                    aria-invalid={!!errors.location?.settlement}
                                    {...register("location.settlement", {
                                        required: "Settlement is required",
                                    })}
                                />
                                {errors.location?.settlement?.message && (
                                    <Field.ErrorText>{errors.location.settlement.message}</Field.ErrorText>
                                )}
                            </Field.Root>

                            <Field.Root>
                                <Input
                                    placeholder="Street"
                                    disabled={isBusy}
                                    {...register("location.street")}
                                />
                            </Field.Root>

                            <Field.Root>
                                <Input
                                    placeholder="House"
                                    disabled={isBusy}
                                    {...register("location.house")}
                                />
                            </Field.Root>

                            <Field.Root>
                                <Input
                                    placeholder="Apartment"
                                    disabled={isBusy}
                                    {...register("location.appartment")}
                                />
                            </Field.Root>
                        </VStack>
                    </Card.Body>

                    <Card.Footer>
                        <Button type="submit" width="full" loading={isBusy} disabled={!isValid || isBusy}>Create Character</Button>
                    </Card.Footer>
                </form>
            </Card.Root>
        </main>
    );
}