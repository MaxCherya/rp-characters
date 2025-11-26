"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchScenario, updateScenario, deleteScenario } from "@/endpoints/events";
import { Scenario, ScenarioFormValues } from "@/types/events";

import { StoryViewer } from "@/components/stories/StoryViewer";
import { EditScenarioModal } from "@/components/events/EditScenarioModal";
import { DeleteScenarioModal } from "@/components/events/DeleteScenarioModal";

import {
    Box,
    Button,
    Heading,
    HStack,
    Spinner,
    Stack,
    Text,
    VStack,
} from "@chakra-ui/react";

export default function ScenarioPage() {
    const params = useParams<{ id: string; eventId: string; scenariosId: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const characterId = Number(params.id);
    const eventId = Number(params.eventId);
    const scenarioId = Number(params.scenariosId);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const {
        data: scenario,
        isLoading,
        isError,
        error,
    } = useQuery<Scenario>({
        queryKey: ["scenario", scenarioId],
        queryFn: () => fetchScenario(scenarioId),
        enabled: !Number.isNaN(scenarioId),
    });

    const updateMutation = useMutation({
        mutationFn: (values: ScenarioFormValues) =>
            updateScenario(scenarioId, values),
        onSuccess: (updated) => {
            queryClient.setQueryData<Scenario>(
                ["scenario", scenarioId],
                updated,
            );
            setIsEditModalOpen(false);
        },
        onError: (err: any) => {
            console.error("Failed to update scenario:", err);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteScenario(scenarioId),
        onSuccess: () => {
            // invalidate this scenario & its parent event
            queryClient.invalidateQueries({ queryKey: ["scenario", scenarioId] });
            queryClient.invalidateQueries({ queryKey: ["event", characterId, eventId] });

            setIsDeleteModalOpen(false);
            router.push(`/characters/${characterId}/events/${eventId}`);
        },
        onError: (err: any) => {
            console.error("Failed to delete scenario:", err);
        },
    });

    const handleEditSave = (values: ScenarioFormValues) => {
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

    if (isError || !scenario) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Text color="red.500">
                    {(error as any)?.message || "Failed to load scenario"}
                </Text>
            </main>
        );
    }

    const isRoot = scenario.parent === null;

    return (
        <main className="min-h-screen flex px-4 justify-center mb-7">
            <Box className="w-full max-w-4xl space-y-8">

                {/* Scenario Title & meta */}
                <VStack align="start" gap={1}>
                    <Text fontSize="3xl" fontWeight="bold">
                        {scenario.title}
                    </Text>

                    <HStack gap={4} className="text-gray-600 text-sm">
                        <Text>Weight: {scenario.weight}</Text>
                        <Text>
                            Type:{" "}
                            <strong>
                                {scenario.is_terminal ? "Terminal" : "Branching"}
                            </strong>
                        </Text>
                    </HStack>

                    <HStack gap={4} className="text-gray-600 text-sm">
                        <Text>
                            Parent:{" "}
                            {isRoot
                                ? "Root scenario (no parent)"
                                : `Scenario #${scenario.parent}`}
                        </Text>
                    </HStack>
                </VStack>

                {/* Actions */}
                <div className="w-full flex flex-row justify-center gap-4">
                    <Button
                        size="md"
                        colorPalette="blue"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="md"
                        colorPalette="red"
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        Delete
                    </Button>
                </div>

                {/* Markdown Viewer */}
                <Box className="w-full bg-white shadow rounded-md overflow-hidden">
                    <StoryViewer markdown={scenario.description ?? ""} />
                </Box>

                {/* Children section */}
                <Box className="mt-6 space-y-4">
                    <Text fontSize="xl" fontWeight="semibold" mb={1}>
                        Child scenarios ({scenario.children.length})
                    </Text>

                    {scenario.children.length === 0 ? (
                        <Text color="gray.500">
                            This scenario has no children.
                            {scenario.is_terminal
                                ? " It is marked as terminal."
                                : " You can create child scenarios branching from this one."}
                        </Text>
                    ) : (
                        <Stack gap={3}>
                            {scenario.children.map((child) => (
                                <Box
                                    key={child.id}
                                    p={4}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    bg="white"
                                    className="hover:shadow transition cursor-pointer"
                                    onClick={() =>
                                        router.push(
                                            `/characters/${characterId}/events/${eventId}/scenarios/${child.id}`,
                                        )
                                    }
                                >
                                    <Heading fontSize="sm" color="gray.700">
                                        {child.title}
                                    </Heading>
                                </Box>
                            ))}
                        </Stack>
                    )}

                    {!scenario.is_terminal && (
                        <Button
                            size="md"
                            onClick={() =>
                                router.push(
                                    `/characters/${characterId}/events/${eventId}/scenarios/create?parent=${scenario.id}`,
                                )
                            }
                        >
                            + Add child scenario
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Edit Scenario Modal */}
            <EditScenarioModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                scenario={scenario}
                onSave={handleEditSave}
                isSubmitting={updateMutation.isPending}
            />

            {/* Delete Scenario Modal */}
            <DeleteScenarioModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                scenarioTitle={scenario.title}
                onConfirm={handleDeleteConfirm}
                isProcessing={deleteMutation.isPending}
            />
        </main>
    );
}