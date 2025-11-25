"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Event, EventFormValues } from "@/types/events";
import { useIsSmallScreen } from "@/hooks/useIsSmallScreen";
import { StoryEditor } from "@/components/stories/StoryEditor";
import { MobileMarkdownEditor } from "@/components/stories/MobileEditor";

type EditEventModalProps = {
    isOpen: boolean;
    onClose: () => void;
    event: Event | null;
    onSave: (values: EventFormValues) => void;
    isSubmitting?: boolean;
};

export const EditEventModal: React.FC<EditEventModalProps> = ({
    isOpen,
    onClose,
    event,
    onSave,
    isSubmitting = false,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<EventFormValues>({
        defaultValues: {
            title: "",
            description: "",
            chance_to_trigger: 50,
        },
    });

    const isSmall = useIsSmallScreen();
    const [descriptionMarkdown, setDescriptionMarkdown] = useState("");

    // load event data into form when modal opens
    useEffect(() => {
        if (event && isOpen) {
            reset({
                title: event.title,
                description: event.description ?? "",
                chance_to_trigger: event.chance_to_trigger,
            });
            setDescriptionMarkdown(event.description ?? "");
        }
    }, [event, isOpen, reset]);

    // body scroll lock
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    if (!isOpen || !event) return null;

    const onSubmit = (values: EventFormValues) => {
        // description must not be blank
        if (!descriptionMarkdown.trim()) {
            setError("description", {
                type: "required",
                message: "Description is required",
            });
            return;
        }

        clearErrors("description");

        onSave({
            title: values.title,
            description: descriptionMarkdown,
            chance_to_trigger: values.chance_to_trigger,
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={handleClose}
        >
            <div
                className="w-full rounded-xl bg-white shadow-xl border border-gray-200 p-4 md:p-6 max-h-[90vh] overflow-y-auto"
                onClick={stopPropagation}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Edit Event</h2>
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
                            placeholder="Event title"
                            disabled={isSubmitting}
                            {...register("title", {
                                required: "Title is required",
                                maxLength: {
                                    value: 255,
                                    message: "Title must be at most 255 characters",
                                },
                            })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.title && (
                            <p className="text-xs text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Chance to trigger */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Chance to trigger (0–100)
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            disabled={isSubmitting}
                            {...register("chance_to_trigger", {
                                required: "Chance is required",
                                min: { value: 0, message: "Minimum is 0" },
                                max: { value: 100, message: "Maximum is 100" },
                                valueAsNumber: true,
                            })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.chance_to_trigger && (
                            <p className="text-xs text-red-500">
                                {errors.chance_to_trigger.message}
                            </p>
                        )}
                    </div>

                    {/* Description (Markdown) */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Description (Markdown)
                        </label>

                        {isSmall ? (
                            <MobileMarkdownEditor
                                initialMarkdown={descriptionMarkdown}
                                onSave={(md) => setDescriptionMarkdown(md)}
                                saveLabel="Apply description"
                            />
                        ) : (
                            <StoryEditor
                                initialMarkdown={descriptionMarkdown}
                                onSave={(md) => setDescriptionMarkdown(md)}
                                saveLabel="Apply description"
                            />
                        )}

                        <p className="text-xs text-gray-500 mt-7 border-t-2">
                            Use the editor above to update the markdown, then click
                            “Save Changes” below to persist it.
                        </p>

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
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};