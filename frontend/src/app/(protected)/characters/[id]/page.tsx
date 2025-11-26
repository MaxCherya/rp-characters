"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCharacter, fetchCharacter, updateCharacter } from "@/endpoints/characters";
import { Button, Card, Heading, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { DeleteConfirmModal } from "@/components/character/DeleteConfirmModal";
import { EditCharacterModal } from "@/components/character/EditCharacterModal";
import { Character, CharacterFormValues } from "@/types/characters";
import { toaster } from "@/components/ui/toaster";
import { FiEdit3 } from "react-icons/fi";
import { FullScreenLoader } from "@/components/ui/fullScreenLoader";

export default function CharacterPage() {
    const params = useParams<{ id: string }>();
    const id = Number(params.id);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["character", id],
        queryFn: () => fetchCharacter(id),
        enabled: !isNaN(id),
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const deleteMutation = useMutation({
        mutationFn: (characterId: number) => deleteCharacter(characterId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["character", id] });
            router.push("/my-characters");
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : "Failed to delete character.";
            alert(message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (values: CharacterFormValues) => updateCharacter(id, values),
        onSuccess: (updated) => {
            queryClient.setQueryData<Character>(["character", id], updated);
            queryClient.invalidateQueries({ queryKey: ["characters"] });
            toaster.create({
                description: "Character updated successfully.",
                type: "success",
            });
            setIsEditModalOpen(false);
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : "Failed to update character.";
            toaster.create({ description: message, type: "error" });
        },
    });

    if (isLoading) {
        return (
            <FullScreenLoader />
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-red-600">Character not found.</p>
            </div>
        );
    }

    const { basic_identity, location } = data;

    const fullName = [basic_identity.name_family, basic_identity.name_given, basic_identity.name_middle]
        .filter(Boolean)
        .join(" ")
        .trim();

    const normalizedFullName = useMemo(
        () => fullName.replace(/\s+/g, " ").trim().toLowerCase(),
        [fullName]
    );

    const normalizedConfirmation = confirmationText
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const isConfirmationValid =
        !!fullName && normalizedFullName === normalizedConfirmation;

    const openDeleteModal = () => {
        setConfirmationText("");
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (!deleteMutation.isPending) {
            setIsDeleteModalOpen(false);
        }
    };

    const handleConfirmDelete = () => {
        if (!isConfirmationValid) return;
        deleteMutation.mutate(id);
    };

    const openEditModal = () => {
        setIsEditModalOpen(true);
    };

    return (
        <main className="min-h-screen mb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Card.Root className="shadow-lg">
                    <Card.Header className="bg-black text-white text-center py-8">
                        <Heading size="xl" className="tracking-wider">CHARACTER PROFILE</Heading>
                        <Text fontSize="lg" className="mt-2 opacity-90">ID: {data.id}</Text>
                    </Card.Header>

                    <Card.Body className="p-10 space-y-8 text-lg">
                        {/* Full Name */}
                        <div className="text-center border-b pb-6">
                            <Text className="text-3xl font-bold">{fullName || "NAME NOT SPECIFIED"}</Text>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={openEditModal}
                                className="!text-gray-700"
                            >
                                <FiEdit3 /> Edit
                            </Button>
                        </div>

                        {/* Basic Identity */}
                        <div className="space-y-4">
                            <Text className="font-semibold text-gray-700 uppercase text-sm tracking-wider">Basic Identity</Text>
                            <div className="space-y-3 text-gray-800">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Given Name</span>
                                    <span className="font-medium">{basic_identity.name_given || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Family Name</span>
                                    <span className="font-medium">{basic_identity.name_family || "—"}</span>
                                </div>
                                {basic_identity.name_middle && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Middle Name</span>
                                        <span className="font-medium">{basic_identity.name_middle}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date of Birth</span>
                                    <span className="font-medium">{basic_identity.date_of_birth || "—"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4 pt-6 border-t">
                            <Text className="font-semibold text-gray-700 uppercase text-sm tracking-wider">Location</Text>
                            <div className="space-y-3 text-gray-800">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Country</span>
                                    <span className="font-medium">{location.country}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Region</span>
                                    <span className="font-medium">{location.state_province || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Settlement</span>
                                    <span className="font-medium">{location.settlement}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Street / House</span>
                                    <span className="font-medium">{location.street} {location.house}</span>
                                </div>
                                {location.appartment && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Apartment</span>
                                        <span className="font-medium">{location.appartment}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Postal Code</span>
                                    <span className="font-medium">{location.zip_code}</span>
                                </div>
                            </div>
                        </div>

                        {/* Character Features / Workspace */}
                        <div className="pt-6 border-t">
                            <Text className="font-semibold text-gray-700 uppercase text-sm tracking-wider">
                                Character Workspace
                            </Text>
                            <Text className="mt-2 text-gray-700 text-sm">
                                Manage extended information and creative content linked to this character.
                            </Text>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/characters/${id}/stories`)}
                                >
                                    Stories
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/characters/${id}/events`)}
                                >
                                    Events
                                </Button>

                            </div>
                        </div>


                        {/* Danger Zone / Deletion */}
                        {fullName && (
                            <div className="pt-8 border-t mt-8">
                                <Text className="font-semibold text-red-700 uppercase text-sm tracking-wider">Record Deletion</Text>
                                <Text className="mt-3 text-gray-700">
                                    Deleting this character will permanently remove the record
                                    from the registry and all its children. This action cannot be undone.
                                </Text>
                                <div className="mt-5 flex justify-end">
                                    <Button colorScheme="red" variant="outline" onClick={openDeleteModal}>Delete Character</Button>
                                </div>
                            </div>
                        )}
                    </Card.Body>

                    <Card.Footer className="bg-gray-100 text-center py-4">
                        <Text fontSize="sm" className="text-gray-600">Official Record • Access Restricted</Text>
                    </Card.Footer>
                </Card.Root>
            </div>

            {/* Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                fullName={fullName}
                confirmationText={confirmationText}
                setConfirmationText={setConfirmationText}
                onConfirm={handleConfirmDelete}
                isProcessing={deleteMutation.isPending}
                isConfirmationValid={isConfirmationValid}
            />

            {/* Edit modal */}
            <EditCharacterModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                character={data}
                onSave={(values) => updateMutation.mutate(values)}
                isProcessing={updateMutation.isPending}
            />
        </main>
    );
}