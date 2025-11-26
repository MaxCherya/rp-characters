"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createEvent } from "@/endpoints/events";
import { EventFormValues } from "@/types/events";

import { useIsSmallScreen } from "@/hooks/useIsSmallScreen";
import { StoryEditor } from "@/components/stories/StoryEditor";
import { MobileMarkdownEditor } from "@/components/stories/MobileEditor";

import {
    Box,
    Button,
    Input,
    Text,
    VStack,
    HStack,
} from "@chakra-ui/react";

export default function EventCreate() {
    const params = useParams<{ id: string }>();
    const characterId = Number(params.id);

    const router = useRouter();
    const queryClient = useQueryClient();
    const isSmall = useIsSmallScreen();

    const [descriptionMarkdown, setDescriptionMarkdown] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<EventFormValues>({
        defaultValues: {
            title: "",
            description: "",
            chance_to_trigger: 100,
        },
    });

    const createMutation = useMutation({
        mutationFn: (values: EventFormValues) =>
            createEvent(characterId, values),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["events", characterId],
            });
            router.push(`/characters/${characterId}/events`);
        },
        onError: (err: any) => {
            setFormError(err?.message || "Failed to create event");
        },
    });

    const onSubmit = (values: EventFormValues) => {
        setFormError(null);

        if (!descriptionMarkdown.trim()) {
            setError("description", {
                type: "required",
                message: "Description is required",
            });
            return;
        }
        clearErrors("description");

        const payload: EventFormValues = {
            title: values.title,
            description: descriptionMarkdown,
            chance_to_trigger: values.chance_to_trigger,
        };

        createMutation.mutate(payload);
    };

    const isSubmitting = createMutation.isPending;

    if (!characterId || Number.isNaN(characterId)) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Text color="red.500">Invalid character id</Text>
            </main>
        );
    }

    return (
        <main className="min-h-screen px-6 py-8 flex justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-4xl space-y-6"
            >
                <VStack align="start" gap={4} width="full">
                    <HStack justify="space-between" width="full">
                        <Text fontSize="lg" fontWeight="semibold">
                            Create Event for character #{characterId}
                        </Text>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                router.push(
                                    `/characters/${characterId}/events`,
                                )
                            }
                        >
                            ← Back
                        </Button>
                    </HStack>

                    {/* General form error */}
                    {formError && (
                        <Box
                            bg="white"
                            p={3}
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor="red.300"
                            width="full"
                        >
                            <Text color="red.500" fontSize="sm">
                                {formError}
                            </Text>
                        </Box>
                    )}

                    {/* Title */}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            bg="white"
                            placeholder="Event title..."
                            disabled={isSubmitting}
                            {...register("title", {
                                required: "Title is required",
                                maxLength: {
                                    value: 255,
                                    message:
                                        "Title must be at most 255 characters",
                                },
                            })}
                        />
                        {errors.title && (
                            <Text fontSize="xs" color="red.500" mt={1}>
                                {errors.title.message}
                            </Text>
                        )}
                    </div>

                    {/* Chance to trigger */}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">
                            Chance to trigger (%){" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <Input
                            bg="white"
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={100}
                            disabled={isSubmitting}
                            {...register("chance_to_trigger", {
                                required: "Chance to trigger is required",
                                valueAsNumber: true,
                                min: {
                                    value: 0,
                                    message: "Minimum is 0",
                                },
                                max: {
                                    value: 100,
                                    message: "Maximum is 100",
                                },
                            })}
                        />
                        {errors.chance_to_trigger && (
                            <Text fontSize="xs" color="red.500" mt={1}>
                                {errors.chance_to_trigger.message}
                            </Text>
                        )}
                        <Text fontSize="xs" color="gray.500" mt={1}>
                            Rough probability that this event can fire when
                            conditions are met.
                        </Text>
                    </div>

                    {/* Description Markdown */}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">
                            Description (Markdown){" "}
                            <span className="text-red-500">*</span>
                        </label>

                        {isSmall ? (
                            <MobileMarkdownEditor
                                initialMarkdown={descriptionMarkdown}
                                onSave={(md) => setDescriptionMarkdown(md)}
                                saveLabel="Apply description"
                            />
                        ) : (
                            <StoryEditor
                                initialMarkdown={descriptionMarkdown}
                                onSave={(md) => setDescriptionMarkdown(md)}
                                saveLabel="Apply description"
                            />
                        )}

                        <Text fontSize="xs" color="gray.500" mt={7}>
                            Use the editor above to write the event in Markdown,
                            then click &quot;Create event&quot; below.
                        </Text>

                        {errors.description && (
                            <Text fontSize="xs" color="red.500" mt={1}>
                                {errors.description.message}
                            </Text>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        loading={isSubmitting}
                        loadingText="Creating..."
                        className="w-full"
                    >
                        Create event
                    </Button>
                </VStack>
            </form>
        </main>
    );
}