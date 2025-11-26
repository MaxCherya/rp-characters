'use client';

import React, { useState } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { Button, HStack } from '@chakra-ui/react';

type StoryEditorProps = {
    initialMarkdown?: string;
    onSave: (markdown: string) => void;
    saveLabel?: string;
};

const StoryEditorInner: React.FC<StoryEditorProps> = ({
    initialMarkdown = '',
    onSave,
    saveLabel = 'Save story',
}) => {
    const [markdown, setMarkdown] = useState(initialMarkdown);

    const { get } = useEditor(
        (root) => {
            const crepe = new Crepe({
                root,
                defaultValue: initialMarkdown || '',
                featureConfigs: {
                    [Crepe.Feature.ImageBlock]: {
                        blockUploadPlaceholderText: 'Paste image URL…',
                        inlineUploadPlaceholderText: 'Paste image URL…',
                        blockUploadButton: 'Insert image from URL',
                        inlineUploadButton: 'Insert image from URL',
                    },
                },
            });

            crepe.on((listener) => {
                listener.markdownUpdated((_, md) => {
                    setMarkdown(md);
                });

                const rootEl = root as HTMLElement | null;
                if (!rootEl) return;

                rootEl
                    .querySelectorAll('input[type="file"]')
                    .forEach((input) => input.remove());

                const observer = new MutationObserver(() => {
                    rootEl
                        .querySelectorAll('input[type="file"]')
                        .forEach((input) => input.remove());
                });

                observer.observe(rootEl, { childList: true, subtree: true });
            });

            return crepe;
        },
        [initialMarkdown],
    );

    const handleSave = () => {
        const crepe = get();
        const value =
            crepe && typeof (crepe as any).getMarkdown === 'function'
                ? (crepe as any).getMarkdown()
                : markdown;

        onSave(value);
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="story-editor min-h-screen bg-white overflow-y-auto">
                <Milkdown />
            </div>

            <HStack justify="flex-end">
                <Button onClick={handleSave} colorScheme="blue">
                    {saveLabel}
                </Button>
            </HStack>
        </div>
    );
};

export const StoryEditor: React.FC<StoryEditorProps> = (props) => (
    <MilkdownProvider>
        <StoryEditorInner {...props} />
    </MilkdownProvider>
);