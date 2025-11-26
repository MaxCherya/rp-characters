'use client';

import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import {
    Editor,
    rootCtx,
    defaultValueCtx,
    editorViewOptionsCtx,
} from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

type StoryViewerProps = {
    markdown: string;
};

const StoryViewerInner: React.FC<StoryViewerProps> = ({ markdown }) => {
    useEditor(
        (root) =>
            Editor.make()
                .config((ctx) => {
                    ctx.set(rootCtx, root);
                    ctx.set(defaultValueCtx, markdown);

                    // read-only
                    ctx.set(editorViewOptionsCtx, {
                        editable: () => false,
                    });

                    nord(ctx);
                })
                .use(commonmark),
        [markdown],
    );

    return (
        <div className="w-full min-h-screen bg-white overflow-auto">
            <div className="story-viewer">
                <Milkdown />
            </div>
        </div>
    );
};

export const StoryViewer: React.FC<StoryViewerProps> = (props) => (
    <MilkdownProvider>
        <StoryViewerInner {...props} />
    </MilkdownProvider>
);