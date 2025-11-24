'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Story, StoryFormValues } from '@/types/stories';

type EditStoryModalProps = {
    isOpen: boolean;
    onClose: () => void;
    story: Story | null;
    onSave: (values: StoryFormValues) => void;
    isSubmitting?: boolean;
};

export const EditStoryModal: React.FC<EditStoryModalProps> = ({
    isOpen,
    onClose,
    story,
    onSave,
    isSubmitting = false,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<StoryFormValues>({
        defaultValues: {
            title: '',
            description: '',
            markdown: '',
        },
    });

    useEffect(() => {
        if (story && isOpen) {
            reset({
                title: story.title,
                description: story.description ?? '',
                markdown: story.markdown ?? '',
            });
        }
    }, [story, isOpen, reset]);

    // body scroll lock
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    if (!isOpen || !story) return null;

    const onSubmit = (values: StoryFormValues) => {
        onSave({
            title: values.title,
            description: values.description ?? '',
            markdown: values.markdown ?? story.markdown ?? '',
        });
    };

    const handleClose = () => {
        if (isSubmitting) return;
        reset();
        onClose();
    };

    const stopPropagation: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 p-6"
                onClick={stopPropagation}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Edit Story</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Title */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Story title"
                            disabled={isSubmitting}
                            {...register('title', {
                                required: 'Title is required',
                                maxLength: {
                                    value: 255,
                                    message: 'Title must be at most 255 characters',
                                },
                            })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.title && (
                            <p className="text-xs text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            placeholder="Short description (optional)"
                            disabled={isSubmitting}
                            {...register('description', {
                                maxLength: {
                                    value: 500,
                                    message: 'Description must be at most 500 characters',
                                },
                            })}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* Footer buttons */}
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};