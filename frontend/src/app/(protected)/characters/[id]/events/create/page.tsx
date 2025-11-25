"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { EventFormValues } from "@/types/events";
import { createEvent } from "@/endpoints/events";

import { useIsSmallScreen } from "@/hooks/useIsSmallScreen";
import { StoryEditor } from "@/components/stories/StoryEditor";
import { MobileMarkdownEditor } from "@/components/stories/MobileEditor";

import {
    Box,
    Button,
    VStack,
    Text,
    Input,
    Heading,
} from "@chakra-ui/react";

export default function EventsCreate() {
    const params = useParams<{ id: string }>();
    const characterId = Number(params.id);
    const router = useRouter();
    const queryClient = useQueryClient();
    const isSmall = useIsSmallScreen();

    // markdown not part of react-hook-form
    const [descriptionMarkdown, setDescriptionMarkdown] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<EventFormValues>({
        defaultValues: {
            title: "",
            description: "",
            chance_to_trigger: 50,
        },
    });

    const [formError, setFormError] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: (values: EventFormValues) =>
            createEvent(characterId, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events", characterId] });
            router.push(`/characters/${characterId}/events`);
        },
        onError: (err: any) => {
            setFormError(err?.message || "Failed to create event");
        },
    });

    const onSubmit = (values: EventFormValues) => {
        setFormError(null);

        createMutation.mutate({
            ...values,
            description: descriptionMarkdown,
        });
    };

    const isSubmitting = createMutation.isPending;

    return (
        <main className="min-h-screen px-6 py-8 flex justify-center bg-gray-100">
            <Box
                as="form"
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-4xl space-y-6"
            >
                <VStack align="start" gap={4} width="full">

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
                        <Heading>Title</Heading>
                        <Input
                            bg="white"
                            placeholder="Event title..."
                            {...register("title", { required: "Title is required" })}
                        />

                        {errors.title && (
                            <Text fontSize="xs" color="red.500" mt={1}>
                                {errors.title.message}
                            </Text>
                        )}
                    </div>

                    {/* Chance to trigger (0–100) */}
                    <div className="w-full">
                        <Heading>Chance to trigger (0–100)</Heading>
                        <Input
                            bg="white"
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={50}
                            {...register("chance_to_trigger", {
                                required: "Chance is required",
                                min: { value: 0, message: "Min is 0" },
                                max: { value: 100, message: "Max is 100" },
                                valueAsNumber: true,
                            })}
                        />

                        {errors.chance_to_trigger && (
                            <Text fontSize="xs" color="red.500" mt={1}>
                                {errors.chance_to_trigger.message}
                            </Text>
                        )}
                    </div>

                    {/* Description Markdown */}
                    <div className="w-full">
                        <Heading>Description (Markdown)</Heading>

                        {isSmall ? (
                            <MobileMarkdownEditor
                                initialMarkdown=""
                                onSave={(md) => setDescriptionMarkdown(md)}
                                saveLabel="Apply description"
                            />
                        ) : (
                            <StoryEditor
                                initialMarkdown=""
                                onSave={(md) => setDescriptionMarkdown(md)}
                                saveLabel="Apply description"
                            />
                        )}

                        <Text fontSize="xs" color="gray.500" mt={7}>
                            Press “Apply description” in the editor above to set the
                            markdown. Then press **Create event**.
                        </Text>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        colorScheme="blue"
                        loading={isSubmitting}
                        loadingText="Creating..."
                        className="w-full"
                        disabled={formError ? true : false}
                    >
                        Create event
                    </Button>
                </VStack>
            </Box>
        </main>
    );
}