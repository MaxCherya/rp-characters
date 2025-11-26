"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Story, StoryFormValues } from "@/types/stories";
import {
    Button,
    Card,
    Heading,
    HStack,
    Stack,
    Text,
    VStack,
    IconButton,
    Spinner,
    Box,
} from "@chakra-ui/react";
import {
    fetchStories,
    createStory,
    updateStory,
    deleteStory,
} from "@/endpoints/stories";
import { CreateStoryModal } from "@/components/stories/CreateStoryModal";
import { EditStoryModal } from "@/components/stories/EditStoryModal";
import { FiTrash2 } from "react-icons/fi";
import { DeleteStoryModal } from "@/components/stories/DeleteStoryModal";
import { MdOpenInNew } from "react-icons/md";
import { GoPencil } from "react-icons/go";

export default function CharacterStoryPage() {
    const params = useParams<{ id: string }>();
    const characterId = Number(params.id);
    const router = useRouter();
    const queryClient = useQueryClient();

    // Modals & local UI state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [storyToEdit, setStoryToEdit] = useState<Story | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);

    const [actionError, setActionError] = useState<string | null>(null);

    // ---------- Queries ----------

    const {
        data: stories,
        isLoading,
        isError,
        error,
    } = useQuery<Story[]>({
        queryKey: ["stories", characterId],
        queryFn: () => fetchStories(characterId),
        enabled: !Number.isNaN(characterId),
    });

    // ---------- Mutations ----------

    const createMutation = useMutation({
        mutationFn: (values: StoryFormValues) =>
            createStory(characterId, {
                title: values.title,
                description: values.description ?? "",
                markdown: "",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stories", characterId] });
            setIsCreateModalOpen(false);
            setActionError(null);
        },
        onError: (err: any) => {
            setActionError(err?.message || "Failed to create story");
        },
    });

    const editMutation = useMutation({
        mutationFn: (params: { story: Story; values: StoryFormValues }) =>
            updateStory(params.story.id, {
                title: params.values.title,
                description: params.values.description ?? "",
                markdown: params.story.markdown ?? "",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stories", characterId] });
            setIsEditModalOpen(false);
            setStoryToEdit(null);
            setActionError(null);
        },
        onError: (err: any) => {
            setActionError(err?.message || "Failed to update story");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (story: Story) => deleteStory(story.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stories", characterId] });
            setIsDeleteModalOpen(false);
            setStoryToDelete(null);
            setActionError(null);
        },
        onError: (err: any) => {
            setActionError(err?.message || "Failed to delete story");
        },
    });

    // ---------- Handlers ----------

    // Create story
    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => {
        if (!createMutation.isPending) setIsCreateModalOpen(false);
    };

    const handleCreateStory = (values: StoryFormValues) => {
        setActionError(null);
        createMutation.mutate(values);
    };

    // Edit story
    const openEditModal = (story: Story) => {
        setStoryToEdit(story);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        if (!editMutation.isPending) {
            setIsEditModalOpen(false);
            setStoryToEdit(null);
        }
    };

    const handleEditStorySave = (values: StoryFormValues) => {
        if (!storyToEdit) return;
        setActionError(null);
        editMutation.mutate({ story: storyToEdit, values });
    };

    // Delete story
    const openDeleteModal = (story: Story) => {
        setStoryToDelete(story);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (!deleteMutation.isPending) {
            setIsDeleteModalOpen(false);
            setStoryToDelete(null);
        }
    };

    const handleConfirmDelete = () => {
        if (!storyToDelete) return;
        setActionError(null);
        deleteMutation.mutate(storyToDelete);
    };

    const queryErrorMessage =
        (error as any)?.message || (isError ? "Failed to load stories" : null);

    return (
        <main className="min-h-screen p-6 flex flex-col items-center">
            <div className="mb-4 w-full max-w-3xl flex justify-end items-center">
                <Button onClick={openCreateModal}>+ Create New Story</Button>
            </div>

            {/* Loading */}
            {isLoading && (
                <HStack justify="center" width="full" py={10}>
                    <Spinner size="lg" />
                </HStack>
            )}

            {/* Errors */}
            {(queryErrorMessage || actionError) && (
                <Box
                    bg="white"
                    p={4}
                    borderRadius="md"
                    borderWidth="1px"
                    width="full"
                    maxW="3xl"
                    mb={4}
                >
                    <Text color="red.500">
                        {queryErrorMessage || actionError}
                    </Text>
                </Box>
            )}

            {/* Empty state */}
            {!isLoading && !isError && (stories?.length ?? 0) === 0 && (
                <p className="text-gray-500">No stories yet. Create one!</p>
            )}

            {/* Stories list */}
            {!isLoading && !isError && (stories?.length ?? 0) > 0 && (
                <VStack gap={4} width="full" maxW="3xl">
                    {stories!.map((story) => (
                        <Card.Root
                            key={story.id}
                            width="full"
                            borderWidth="1px"
                            borderRadius="md"
                            className="hover:shadow-md transition cursor-pointer"
                        >
                            <Card.Body>
                                <Stack
                                    direction={{ base: "column", md: "row" }}
                                    align={{ base: "stretch", md: "flex-start" }}
                                    justify="space-between"
                                    gap={4}
                                >
                                    {/* Left side: text */}
                                    <VStack align="start" gap={1} flex="1">
                                        <Heading size="md">{story.title}</Heading>

                                        {story.description && (
                                            <Text fontSize="sm" color="gray.600">
                                                {story.description}
                                            </Text>
                                        )}

                                        <Text fontSize="xs" color="gray.400">
                                            Updated:{" "}
                                            {new Date(story.updated).toLocaleString()}
                                        </Text>
                                    </VStack>

                                    {/* Right side: actions */}
                                    <HStack
                                        gap={2}
                                        w={{ base: "100%", md: "auto" }}
                                        justify={{ base: "flex-end", md: "flex-end" }}
                                    >
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                router.push(
                                                    `/characters/${characterId}/stories/${story.id}`,
                                                )
                                            }
                                        >
                                            <MdOpenInNew />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEditModal(story)}
                                        >
                                            <GoPencil />
                                        </Button>
                                        <IconButton
                                            aria-label="Delete story"
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="red"
                                            onClick={() => openDeleteModal(story)}
                                        >
                                            <FiTrash2 />
                                        </IconButton>
                                    </HStack>
                                </Stack>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </VStack>
            )}

            {/* Modals */}
            <CreateStoryModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                onCreate={handleCreateStory}
                isSubmitting={createMutation.isPending}
            />

            <EditStoryModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                story={storyToEdit}
                onSave={handleEditStorySave}
                isSubmitting={editMutation.isPending}
            />

            <DeleteStoryModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                storyTitle={storyToDelete?.title ?? null}
                onConfirm={handleConfirmDelete}
                isProcessing={deleteMutation.isPending}
            />
        </main>
    );
}