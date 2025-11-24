import { useState } from "react";

type MobileMarkdownEditorProps = {
    initialMarkdown?: string;
    onSave: (markdown: string) => void;
    saveLabel?: string;
};

export const MobileMarkdownEditor: React.FC<MobileMarkdownEditorProps> = ({
    initialMarkdown = '',
    onSave,
    saveLabel = 'Save story',
}) => {
    const [value, setValue] = useState(initialMarkdown);

    const handleSave = () => onSave(value);

    return (
        <div className="flex flex-col gap-3 w-full">
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full min-h-[60vh] rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your story in Markdown..."
            />
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                    {saveLabel}
                </button>
            </div>
        </div>
    );
};