'use client';

import { fetchCountriesOptions } from "@/endpoints/external";
import { toDateInputValueFromDotted } from "@/lib/helpers/date";
import { Character, CharacterFormValues } from "@/types/characters";
import { CountryOption } from "@/types/external";
import { Field } from "@ark-ui/react";
import { Heading, Input, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface EditCharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
    character: Character;
    onSave: (values: CharacterFormValues) => void;
    isProcessing: boolean;
}

export function EditCharacterModal({
    isOpen,
    onClose,
    character,
    onSave,
    isProcessing,
}: EditCharacterModalProps) {

    useEffect(() => {
        if (!isOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
        reset,
    } = useForm<CharacterFormValues>({
        mode: "onChange",
        defaultValues: {
            basic_identity: {
                name_given: character.basic_identity.name_given || "",
                name_family: character.basic_identity.name_family || "",
                name_middle: character.basic_identity.name_middle || "",
                date_of_birth: toDateInputValueFromDotted(character.basic_identity.date_of_birth),
            },
            location: {
                country: character.location.country || "",
                state_province: character.location.state_province || "",
                zip_code: character.location.zip_code || "",
                settlement: character.location.settlement || "",
                street: character.location.street || "",
                house: character.location.house || "",
                appartment: character.location.appartment || "",
            },
        },
    });

    useEffect(() => {
        if (!isOpen) return;
        reset({
            basic_identity: {
                name_given: character.basic_identity.name_given || "",
                name_family: character.basic_identity.name_family || "",
                name_middle: character.basic_identity.name_middle || "",
                date_of_birth: toDateInputValueFromDotted(character.basic_identity.date_of_birth),
            },
            location: {
                country: character.location.country || "",
                state_province: character.location.state_province || "",
                zip_code: character.location.zip_code || "",
                settlement: character.location.settlement || "",
                street: character.location.street || "",
                house: character.location.house || "",
                appartment: character.location.appartment || "",
            },
        });
    }, [character, isOpen, reset]);

    const { data: countries, isLoading: isCountriesLoading, isError: isCountriesError } =
        useQuery<CountryOption[]>({
            queryKey: ["countries-options"],
            queryFn: fetchCountriesOptions,
            enabled: isOpen,
        });

    if (!isOpen) return null;

    const busy = isSubmitting || isProcessing;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !busy) {
            onClose();
        }
    };

    const onSubmit = (values: CharacterFormValues) => {
        onSave(values);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-1">Edit Character Record</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Adjust the basic identity and registered address of the character. All
                    changes are recorded as part of the official history.
                </p>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void handleSubmit(onSubmit)(e);
                    }}
                >
                    <VStack gap={4} align="stretch">
                        {/* BASIC IDENTITY */}
                        <Heading size="sm">Basic Identity</Heading>

                        <Field.Root invalid={!!errors.basic_identity?.name_given}>
                            <Input
                                placeholder="Given name"
                                disabled={busy}
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
                                <Field.ErrorText>
                                    {errors.basic_identity.name_given.message}
                                </Field.ErrorText>
                            )}
                        </Field.Root>

                        <Field.Root invalid={!!errors.basic_identity?.name_family}>
                            <Input
                                placeholder="Family name"
                                disabled={busy}
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
                                <Field.ErrorText>
                                    {errors.basic_identity.name_family.message}
                                </Field.ErrorText>
                            )}
                        </Field.Root>

                        <Field.Root>
                            <Input
                                placeholder="Middle name (optional)"
                                disabled={busy}
                                {...register("basic_identity.name_middle")}
                            />
                        </Field.Root>

                        <Field.Root>
                            <Input
                                type="date"
                                placeholder="Date of birth"
                                disabled={busy}
                                {...register("basic_identity.date_of_birth")}
                            />
                        </Field.Root>

                        {/* LOCATION */}
                        <Heading size="sm" pt={2}>Location</Heading>

                        <Field.Root invalid={!!errors.location?.country}>
                            <select
                                {...register("location.country", {
                                    required: "Country is required",
                                })}
                                disabled={busy || isCountriesLoading || isCountriesError}
                                aria-invalid={!!errors.location?.country}
                                className="!block !w-full !rounded-md !border !border-gray-300 !px-3 !py-2 !text-sm !bg-white"
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
                                <Field.ErrorText>
                                    {errors.location.country.message}
                                </Field.ErrorText>
                            )}
                        </Field.Root>

                        <Field.Root>
                            <Input
                                placeholder="State / Province"
                                disabled={busy}
                                {...register("location.state_province")}
                            />
                        </Field.Root>

                        <Field.Root invalid={!!errors.location?.zip_code}>
                            <Input
                                placeholder="ZIP Code"
                                disabled={busy}
                                aria-invalid={!!errors.location?.zip_code}
                                {...register("location.zip_code", {
                                    minLength: {
                                        value: 3,
                                        message: "ZIP code must be at least 3 characters",
                                    },
                                })}
                            />
                            {errors.location?.zip_code?.message && (
                                <Field.ErrorText>
                                    {errors.location.zip_code.message}
                                </Field.ErrorText>
                            )}
                        </Field.Root>

                        <Field.Root invalid={!!errors.location?.settlement}>
                            <Input
                                placeholder="City / Settlement"
                                disabled={busy}
                                aria-invalid={!!errors.location?.settlement}
                                {...register("location.settlement", {
                                    required: "Settlement is required",
                                })}
                            />
                            {errors.location?.settlement?.message && (
                                <Field.ErrorText>
                                    {errors.location.settlement.message}
                                </Field.ErrorText>
                            )}
                        </Field.Root>

                        <Field.Root>
                            <Input
                                placeholder="Street"
                                disabled={busy}
                                {...register("location.street")}
                            />
                        </Field.Root>

                        <Field.Root>
                            <Input
                                placeholder="House"
                                disabled={busy}
                                {...register("location.house")}
                            />
                        </Field.Root>

                        <Field.Root>
                            <Input
                                placeholder="Apartment"
                                disabled={busy}
                                {...register("location.appartment")}
                            />
                        </Field.Root>
                    </VStack>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                            onClick={onClose}
                            disabled={busy}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded text-white bg-black hover:bg-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            disabled={!isValid || busy}
                        >
                            {busy ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}