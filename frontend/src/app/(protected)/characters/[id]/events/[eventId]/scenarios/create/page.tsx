"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchEvent, createEventScenario } from "@/endpoints/events";
import { Event, ScenarioFormValues } from "@/types/events";

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
    Spinner,
} from "@chakra-ui/react";

export default function CreateScenario() {
    const params = useParams<{ id: string; eventId: string }>();
    const searchParams = useSearchParams();

    const characterId = Number(params.id);
    const eventId = Number(params.eventId);

    // parent scenario id comes from ?parent=XYZ or null for root
    const parentParam = searchParams.get("parent");
    const parentId = parentParam ? Number(parentParam) : null;

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
    } = useForm<ScenarioFormValues>({
        defaultValues: {
            parent: parentId,
            title: "",
            description: "",
            weight: 1,
            is_terminal: false,
        },
    });

    // Load event (to show title + find parent scenario info)
    const {
        data: event,
        isLoading: isEventLoading,
        isError: isEventError,
        error: eventError,
    } = useQuery<Event>({
        queryKey: ["event", characterId, eventId],
        queryFn: () => fetchEvent(characterId, eventId),
        enabled: !Number.isNaN(characterId) && !Number.isNaN(eventId),
    });

    const createMutation = useMutation({
        mutationFn: (values: ScenarioFormValues) =>
            createEventScenario(characterId, eventId, values),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["event", characterId, eventId],
            });
            router.push(`/characters/${characterId}/events/${eventId}`);
        },
        onError: (err: any) => {
            setFormError(err?.message || "Failed to create scenario");
        },
    });

    const onSubmit = (values: ScenarioFormValues) => {
        setFormError(null);

        if (!descriptionMarkdown.trim()) {
            setError("description", {
                type: "required",
                message: "Description is required",
            });
            return;
        }
        clearErrors("description");

        const payload: ScenarioFormValues = {
            parent: parentId, // <- parent is determined by URL, not user input
            title: values.title,
            description: descriptionMarkdown,
            weight: values.weight,
            is_terminal: values.is_terminal,
        };

        createMutation.mutate(payload);
    };

    const isSubmitting = createMutation.isPending;

    if (isEventLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </main>
        );
    }

    if (isEventError || !event) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Text color="red.500">
                    {(eventError as any)?.message || "Failed to load event"}
                </Text>
            </main>
        );
    }

    const parentScenario =
        parentId !== null
            ? event.scenarios.find((s) => s.id === parentId)
            : null;

    return (
        <main className="min-h-screen px-4 mb-7 flex justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-4xl space-y-6"
            >
                <VStack align="start" gap={4} width="full">
                    <HStack justify="space-between" width="full">
                        <div>
                            <Text fontSize="lg" fontWeight="semibold">
                                Create Scenario for{" "}
                                <span className="font-bold">
                                    &quot;{event.title}&quot;
                                </span>
                            </Text>
                            <Text fontSize="sm" color="gray.600" mt={1}>
                                Parent:{" "}
                                {parentScenario
                                    ? `#${parentScenario.id} – ${parentScenario.title}`
                                    : "Root (no parent)"}
                            </Text>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                router.push(
                                    `/characters/${characterId}/events/${eventId}`,
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
                            placeholder="Scenario title..."
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

                    {/* Weight */}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">
                            Weight (relative chance among siblings)
                        </label>
                        <Input
                            bg="white"
                            type="number"
                            min={1}
                            defaultValue={1}
                            disabled={isSubmitting}
                            {...register("weight", {
                                required: "Weight is required",
                                min: { value: 1, message: "Minimum is 1" },
                                valueAsNumber: true,
                            })}
                        />
                        {errors.weight && (
                            <Text fontSize="xs" color="red.500" mt={1}>
                                {errors.weight.message}
                            </Text>
                        )}
                        <Text fontSize="xs" color="gray.500" mt={1}>
                            Sibling scenarios will be chosen proportionally to
                            their weights.
                        </Text>
                    </div>

                    {/* Is terminal */}
                    <div className="w-full flex items-center gap-2">
                        <input
                            id="is_terminal"
                            type="checkbox"
                            disabled={isSubmitting}
                            {...register("is_terminal")}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                            htmlFor="is_terminal"
                            className="text-sm text-gray-700"
                        >
                            This scenario is terminal (branch stops here)
                        </label>
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
                            Use the editor above to write the scenario in
                            Markdown, then click &quot;Create scenario&quot;
                            below.
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
                        colorPalette="blue"
                        loading={isSubmitting}
                        loadingText="Creating..."
                    >
                        Create scenario
                    </Button>
                </VStack>
            </form>
        </main>
    );
}