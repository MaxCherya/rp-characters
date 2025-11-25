"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchEvent, updateEvent, deleteEvent } from "@/endpoints/events";
import { Event, EventFormValues } from "@/types/events";

import { StoryViewer } from "@/components/stories/StoryViewer";
import { EditEventModal } from "@/components/events/EditEventModal";
import { DeleteEventModal } from "@/components/events/DeleteEventModal";

import {
    Box,
    Button,
    HStack,
    Spinner,
    Stack,
    Text,
    VStack,
} from "@chakra-ui/react";

export default function EventPage() {
    const params = useParams<{ id: string; eventId: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const characterId = Number(params.id);
    const eventId = Number(params.eventId);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const {
        data: event,
        isLoading,
        isError,
        error,
    } = useQuery<Event>({
        queryKey: ["event", characterId, eventId],
        queryFn: () => fetchEvent(characterId, eventId),
        enabled: !Number.isNaN(characterId) && !Number.isNaN(eventId),
    });

    const updateMutation = useMutation({
        mutationFn: (values: EventFormValues) =>
            updateEvent(characterId, eventId, values),
        onSuccess: (updated) => {
            queryClient.setQueryData<Event>(
                ["event", characterId, eventId],
                updated,
            );
            setIsEditModalOpen(false);
        },
        onError: (err: any) => {
            console.error("Failed to update event:", err);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteEvent(characterId, eventId),
        onSuccess: () => {
            // invalidate list & go back to events page
            queryClient.invalidateQueries({
                queryKey: ["events", characterId],
            });
            setIsDeleteModalOpen(false);
            router.push(`/characters/${characterId}/events`);
        },
        onError: (err: any) => {
            console.error("Failed to delete event:", err);
        },
    });

    const handleEditSave = (values: EventFormValues) => {
        updateMutation.mutate(values);
    };

    const handleDeleteConfirm = () => {
        deleteMutation.mutate();
    };

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </main>
        );
    }

    if (isError || !event) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Text color="red.500">
                    {(error as any)?.message || "Failed to load event"}
                </Text>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex px-4 justify-center mb-7">
            <Box className="w-full max-w-4xl space-y-8">
                {/* Event Title */}
                <VStack align="start" gap={1}>
                    <Text fontSize="3xl" fontWeight="bold">
                        {event.title}
                    </Text>

                    <HStack gap={4} className="text-gray-600 text-sm">
                        <Text>
                            Created: {new Date(event.created_at).toLocaleString()}
                        </Text>
                        <Text>
                            Modified: {new Date(event.last_modified).toLocaleString()}
                        </Text>
                    </HStack>

                    <Text fontSize="sm" color="gray-700">
                        Chance to trigger:{" "}
                        <strong>{event.chance_to_trigger}%</strong>
                    </Text>
                </VStack>

                <div className="w-full flex flex-row justify-center gap-4">
                    <Button
                        size="md"
                        colorPalette="blue"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Edit
                    </Button>
                    <Button size="md" colorPalette="green">
                        Play
                    </Button>
                    <Button
                        colorPalette="red"
                        size="md"
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        Delete
                    </Button>
                </div>

                {/* Markdown Viewer */}
                <Box className="w-full bg-white shadow rounded-md overflow-hidden">
                    <StoryViewer markdown={event.description ?? ""} />
                </Box>

                {/* Scenarios Section */}
                <Box className="mt-6">
                    <Text fontSize="xl" fontWeight="semibold" mb={4}>
                        Scenarios ({event.scenarios.length})
                    </Text>

                    {event.scenarios.length === 0 ? (
                        <Text color="gray.500">No scenarios yet.</Text>
                    ) : (
                        <Stack gap={3}>
                            {event.scenarios.map((s) => (
                                <Box
                                    key={s.id}
                                    p={4}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    bg="white"
                                    className="hover:shadow transition cursor-pointer"
                                    onClick={() =>
                                        router.push(
                                            `/characters/${characterId}/events/${eventId}/scenarios/${s.id}`,
                                        )
                                    }
                                >
                                    <Text fontSize="md" fontWeight="medium">
                                        {s.title}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Weight: {s.weight} │{" "}
                                        {s.is_terminal ? "Terminal" : "Continues"}
                                    </Text>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>

                {/* Add scenario */}
                <Button
                    size="md"
                    onClick={() =>
                        router.push(
                            `/characters/${characterId}/events/${eventId}/scenarios/create`,
                        )
                    }
                >
                    + Add Scenario
                </Button>
            </Box>

            {/* Edit Event Modal */}
            <EditEventModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                event={event}
                onSave={handleEditSave}
                isSubmitting={updateMutation.isPending}
            />

            {/* Delete Event Modal */}
            <DeleteEventModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                eventTitle={event.title}
                onConfirm={handleDeleteConfirm}
                isProcessing={deleteMutation.isPending}
            />
        </main>
    );
}