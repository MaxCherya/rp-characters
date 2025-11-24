'use client';

import { StoryEditor } from '@/components/stories/StoryEditor';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

export default function CharacterStoryPage() {
    const params = useParams<{ id: string }>();

    const [storyMarkdown, setStoryMarkdown] = useState<string>('');

    const handleSave = async (md: string) => {
        setStoryMarkdown(md);

        // TODO: call your API here
        // await fetch(`/api/characters/${id}/stories/`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ content: md }),
        // });
    };

    return (
        <main className="min-h-screen p-6">
            <h1 className="text-2xl font-semibold mb-4">
                Story for character #{params.id}
            </h1>

            <StoryEditor
                initialMarkdown={storyMarkdown}
                onSave={handleSave}
                saveLabel="Save story"
            />

            <h2 className="mt-6 text-sm font-semibold text-gray-500">
                Current markdown (what you’d store in DB):
            </h2>
            <pre className="mt-2 text-xs bg-black text-green-400 p-3 rounded">
                {storyMarkdown}
            </pre>
        </main>
    );
}