"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCharacter } from "@/endpoints/characters";
import { Card, Heading, Text } from "@chakra-ui/react";

export default function CharacterPage() {
    const params = useParams<{ id: string }>();
    const id = Number(params.id);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["character", id],
        queryFn: () => fetchCharacter(id),
        enabled: !isNaN(id),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-600">Loading character...</p>
            </div>
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
                            <Text className="font-semibold text-gray-700 uppercase text-sm tracking-wider">Registered Address</Text>
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
                    </Card.Body>

                    <Card.Footer className="bg-gray-100 text-center py-4">
                        <Text fontSize="sm" className="text-gray-600">Official Record • Access Restricted</Text>
                    </Card.Footer>
                </Card.Root>
            </div>
        </main>
    );
}