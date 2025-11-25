"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Scenario, ScenarioFormValues } from "@/types/events";
import { useIsSmallScreen } from "@/hooks/useIsSmallScreen";
import { StoryEditor } from "@/components/stories/StoryEditor";
import { MobileMarkdownEditor } from "@/components/stories/MobileEditor";

type EditScenarioModalProps = {
    isOpen: boolean;
    onClose: () => void;
    scenario: Scenario | null;
    onSave: (values: ScenarioFormValues) => void;
    isSubmitting?: boolean;
};

export const EditScenarioModal: React.FC<EditScenarioModalProps> = ({
    isOpen,
    onClose,
    scenario,
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
    } = useForm<ScenarioFormValues>({
        defaultValues: {
            parent: null,
            title: "",
            description: "",
            weight: 1,
            is_terminal: false,
        },
    });

    const isSmall = useIsSmallScreen();
    const [descriptionMarkdown, setDescriptionMarkdown] = useState("");

    // load scenario data into form when modal opens
    useEffect(() => {
        if (scenario && isOpen) {
            reset({
                parent: scenario.parent,
                title: scenario.title,
                description: scenario.description ?? "",
                weight: scenario.weight,
                is_terminal: scenario.is_terminal,
            });
            setDescriptionMarkdown(scenario.description ?? "");
        }
    }, [scenario, isOpen, reset]);

    // body scroll lock
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    if (!isOpen || !scenario) return null;

    const onSubmit = (values: ScenarioFormValues) => {
        if (!descriptionMarkdown.trim()) {
            setError("description", {
                type: "required",
                message: "Description is required",
            });
            return;
        }

        clearErrors("description");

        onSave({
            parent: scenario.parent, // parent is fixed here
            title: values.title,
            description: descriptionMarkdown,
            weight: values.weight,
            is_terminal: values.is_terminal,
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
                    <h2 className="text-lg font-semibold">Edit Scenario</h2>
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
                            placeholder="Scenario title"
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
                            <p className="text-xs text-red-500">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Weight */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Weight (relative chance among siblings)
                        </label>
                        <input
                            type="number"
                            min={1}
                            disabled={isSubmitting}
                            {...register("weight", {
                                required: "Weight is required",
                                min: { value: 1, message: "Minimum is 1" },
                                valueAsNumber: true,
                            })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.weight && (
                            <p className="text-xs text-red-500">
                                {errors.weight.message}
                            </p>
                        )}
                    </div>

                    {/* Is terminal */}
                    <div className="flex items-center gap-2">
                        <input
                            id="is_terminal"
                            type="checkbox"
                            disabled={isSubmitting}
                            {...register("is_terminal")}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                            htmlFor="is_terminal"
                            className="text-sm text-gray-700"
                        >
                            This scenario is terminal (branch stops here)
                        </label>
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