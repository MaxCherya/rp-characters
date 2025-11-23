'use client';

import { useQuery } from "@tanstack/react-query";
import { fetchCharacters } from "@/endpoints/characters";
import {
    Box,
    Button,
    Card,
    Heading,
    HStack,
    Spinner,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function MyCharacters() {
    const router = useRouter();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["characters"],
        queryFn: fetchCharacters,
    });

    return (
        <main className="min-h-screen relative py-10 px-4 bg-gray-100">
            <VStack gap={8} width="full" maxW="3xl" mx="auto">

                {/* Header */}
                <HStack justify="space-between" width="full">
                    <Heading size="lg">My Characters</Heading>
                    <Button size="sm" onClick={() => router.push('/create-character')}>+ New Character</Button>
                </HStack>

                {/* Loading */}
                {isLoading && (
                    <HStack justify="center" width="full" py={20}>
                        <Spinner size="lg" />
                    </HStack>
                )}

                {/* Error */}
                {isError && (
                    <Box bg="white" p={6} borderRadius="md" borderWidth="1px" width="full">
                        <Text color="red.500">Failed to load characters.</Text>
                    </Box>
                )}

                {/* Empty */}
                {!isLoading && data?.length === 0 && (
                    <Card.Root width="full" p={6} borderWidth="1px">
                        <Card.Body>
                            <Text>No characters yet.</Text>
                            <Text fontSize="sm" color="gray.600" mt={1}>Create your first character using the button above.</Text>
                        </Card.Body>
                    </Card.Root>
                )}

                {/* List of Characters */}
                <VStack gap={4} width="full">
                    {data?.map((char) => (
                        <Card.Root
                            key={char.id}
                            width="full"
                            borderWidth="1px"
                            borderRadius="md"
                            className="hover:shadow-md transition"
                        >
                            <Card.Body>
                                <HStack justify="space-between">
                                    <VStack align="start" gap={0}>
                                        <Heading size="md">
                                            {char.basic_identity
                                                ? `${char.basic_identity.name_given} ${char.basic_identity.name_family}`
                                                : `Character #${char.id}`}
                                        </Heading>

                                        {char.location && (
                                            <Text fontSize="sm" color="gray.600">
                                                {char.location.settlement}, {char.location.country}
                                            </Text>
                                        )}
                                    </VStack>

                                    <Button variant="outline" size="sm">View</Button>
                                </HStack>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </VStack>
            </VStack>
        </main>
    );
}