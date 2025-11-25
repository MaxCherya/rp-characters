"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Story } from "@/types/stories";
import { fetchStory, updateStory } from "@/endpoints/stories";
import { StoryEditor } from "@/components/stories/StoryEditor";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { Button, HStack, Spinner, Text, Box } from "@chakra-ui/react";
import { MobileMarkdownEditor } from "@/components/stories/MobileEditor";
import { useIsSmallScreen } from "@/hooks/useIsSmallScreen";

export default function StoryPage() {
    const params = useParams<{ id: string; storyId: string }>();
    const characterId = Number(params.id);
    const storyId = Number(params.storyId);

    const router = useRouter();
    const isSmall = useIsSmallScreen();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    // ---------- Query: load story ----------

    const {
        data: story,
        isLoading,
        isError,
        error,
    } = useQuery<Story>({
        queryKey: ["story", storyId],
        queryFn: () => fetchStory(storyId),
        enabled: !Number.isNaN(storyId),
    });

    // ---------- Mutation: save story ----------

    const updateMutation = useMutation({
        mutationFn: (markdown: string) => {
            if (!story) {
                throw new Error("No story loaded");
            }
            return updateStory(story.id, {
                title: story.title,
                description: story.description ?? "",
                markdown,
            });
        },
        onSuccess: (updated) => {
            // update cache
            queryClient.setQueryData<Story>(["story", storyId], updated);
            setIsEditing(false);
            setActionError(null);
        },
        onError: (err: any) => {
            setActionError(err?.message || "Failed to save story");
        },
    });

    const handleSave = (markdown: string) => {
        setActionError(null);
        updateMutation.mutate(markdown);
    };

    // ---------- Loading / Error states ----------

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </main>
        );
    }

    const queryErrorMessage =
        (error as any)?.message || (isError ? "Failed to load story" : null);

    if (queryErrorMessage || !story) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Text color="red.500">{queryErrorMessage || "Story not found"}</Text>
            </main>
        );
    }

    const saving = updateMutation.isPending;

    return (
        <main className="min-h-screen px-6 flex justify-center">
            <div className="w-full max-w-4xl space-y-6 mb-7">
                {/* Top bar */}
                <div className="w-full flex flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">{story.title}</h1>
                        {story.description && (
                            <p className="text-gray-600">{story.description}</p>
                        )}
                    </div>

                    {!isEditing ? (
                        <Button size="sm" onClick={() => setIsEditing(true)}>
                            Edit
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                    )}
                </div>

                {/* Action error (save) */}
                {actionError && (
                    <Box
                        bg="white"
                        p={3}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="red.300"
                    >
                        <Text color="red.500" fontSize="sm">
                            {actionError}
                        </Text>
                    </Box>
                )}

                {/* VIEW OR EDIT */}
                {!isEditing ? (
                    <StoryViewer markdown={story.markdown ?? ""} />
                ) : isSmall ? (
                    <MobileMarkdownEditor
                        initialMarkdown={story.markdown ?? ""}
                        onSave={handleSave}
                        saveLabel={saving ? "Saving..." : "Save story"}
                    />
                ) : (
                    <StoryEditor
                        initialMarkdown={story.markdown ?? ""}
                        onSave={handleSave}
                        saveLabel={saving ? "Saving..." : "Save story"}
                    />
                )}
            </div>
        </main>
    );
}