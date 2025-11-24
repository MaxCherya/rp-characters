'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Story, StoryFormValues } from '@/types/stories';
import { Button, Card, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { fetchStories, createStory, updateStory } from '@/endpoints/stories';
import { CreateStoryModal } from '@/components/stories/CreateStoryModal';
import { EditStoryModal } from '@/components/stories/EditStoryModal';

export default function CharacterStoryPage() {
    const params = useParams<{ id: string }>();
    const characterId = Number(params.id);

    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [storyToEdit, setStoryToEdit] = useState<Story | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchStories(characterId);
                setStories(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load stories');
            } finally {
                setLoading(false);
            }
        };

        if (!Number.isNaN(characterId)) {
            load();
        }
    }, [characterId]);

    // Create story
    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => {
        if (!isCreating) setIsCreateModalOpen(false);
    };

    const handleCreateStory = async (values: StoryFormValues) => {
        try {
            setIsCreating(true);
            const newStory = await createStory(characterId, {
                title: values.title,
                description: values.description ?? '',
                markdown: '',
            });
            setStories((prev) => [newStory, ...prev]);
            setIsCreateModalOpen(false);
        } catch (err: any) {
            setError(err.message || 'Failed to create story');
        } finally {
            setIsCreating(false);
        }
    };

    // Edit story
    const openEditModal = (story: Story) => {
        setStoryToEdit(story);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        if (!isEditing) {
            setIsEditModalOpen(false);
            setStoryToEdit(null);
        }
    };

    const handleEditStorySave = async (values: StoryFormValues) => {
        if (!storyToEdit) return;
        try {
            setIsEditing(true);
            const updated = await updateStory(storyToEdit.id, {
                title: values.title,
                description: values.description ?? '',
                markdown: storyToEdit.markdown ?? '',
            });

            setStories((prev) =>
                prev.map((s) => (s.id === updated.id ? updated : s)),
            );
            setIsEditModalOpen(false);
            setStoryToEdit(null);
        } catch (err: any) {
            setError(err.message || 'Failed to update story');
        } finally {
            setIsEditing(false);
        }
    };

    return (
        <main className="min-h-screen p-6 flex flex-col items-center">
            <div className="mb-4 w-full max-w-3xl flex justify-end items-center">
                <Button onClick={openCreateModal}>+ Create New Story</Button>
            </div>

            {loading && <p>Loading stories...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && stories.length === 0 && (
                <p className="text-gray-500">No stories yet. Create one!</p>
            )}

            {!loading && !error && stories.length > 0 && (
                <VStack gap={4} width="full" maxW="3xl">
                    {stories.map((story) => (
                        <Card.Root
                            key={story.id}
                            width="full"
                            borderWidth="1px"
                            borderRadius="md"
                            className="hover:shadow-md transition cursor-pointer"
                        >
                            <Card.Body>
                                <HStack justify="space-between" align="start">
                                    <VStack align="start" gap={1}>
                                        <Heading size="md">{story.title}</Heading>

                                        {story.description && (
                                            <Text fontSize="sm" color="gray.600">
                                                {story.description}
                                            </Text>
                                        )}

                                        <Text fontSize="xs" color="gray.400">
                                            Updated: {new Date(story.updated).toLocaleString()}
                                        </Text>
                                    </VStack>

                                    <HStack gap={2}>
                                        <Button size="sm" variant="outline">
                                            Open
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEditModal(story)}
                                        >
                                            Edit
                                        </Button>
                                    </HStack>
                                </HStack>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </VStack>
            )}

            <CreateStoryModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                onCreate={handleCreateStory}
                isSubmitting={isCreating}
            />

            <EditStoryModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                story={storyToEdit}
                onSave={handleEditStorySave}
                isSubmitting={isEditing}
            />
        </main>
    );
}