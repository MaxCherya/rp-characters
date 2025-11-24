'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Story } from '@/types/stories';
import { fetchStory, updateStory } from '@/endpoints/stories';
import { StoryEditor } from '@/components/stories/StoryEditor';
import { StoryViewer } from '@/components/stories/StoryViewer';
import { Button, HStack, Spinner, Text } from '@chakra-ui/react';
import { MobileMarkdownEditor } from '@/components/stories/MobileEditor';
import { useIsSmallScreen } from '@/hooks/useIsSmallScreen';

export default function StoryPage() {
    const params = useParams<{ id: string; storyId: string }>();
    const characterId = Number(params.id);
    const storyId = Number(params.storyId);

    const router = useRouter();
    const isSmall = useIsSmallScreen();

    const [story, setStory] = useState<Story | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchStory(storyId);
                setStory(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load story');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [storyId]);

    const handleSave = async (markdown: string) => {
        if (!story) return;

        try {
            setSaving(true);
            const updated = await updateStory(story.id, {
                title: story.title,
                description: story.description ?? '',
                markdown,
            });
            setStory(updated);
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || 'Failed to save story');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </main>
        );
    }

    if (error || !story) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Text color="red.500">{error || 'Story not found'}</Text>
            </main>
        );
    }

    return (
        <main className="min-h-screen px-6 flex justify-center">
            <div className="w-full max-w-4xl space-y-6 mb-7">

                <div className='w-full flex flex-row justify-between'>
                    <h1 className="text-2xl font-semibold">{story.title}</h1>
                    {story.description && (
                        <p className="text-gray-600">{story.description}</p>
                    )}
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

                {/* VIEW OR EDIT */}
                {!isEditing ? (
                    <StoryViewer markdown={story.markdown ?? ''} />
                ) : isSmall ? (
                    <MobileMarkdownEditor
                        initialMarkdown={story.markdown ?? ''}
                        onSave={handleSave}
                        saveLabel={saving ? 'Saving...' : 'Save story'}
                    />
                ) : (
                    <StoryEditor
                        initialMarkdown={story.markdown ?? ''}
                        onSave={handleSave}
                        saveLabel={saving ? 'Saving...' : 'Save story'}
                    />
                )}

            </div>
        </main>
    );
}