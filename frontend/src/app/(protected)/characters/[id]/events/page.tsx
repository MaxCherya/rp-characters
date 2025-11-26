"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
    Box,
    Button,
    Card,
    Heading,
    HStack,
    Spinner,
    Text,
    VStack,
    SimpleGrid,
} from "@chakra-ui/react";

import { fetchEvents } from "@/endpoints/events";
import { Event } from "@/types/events";

export default function Events() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const characterId = Number(params.id);

    const {
        data: events,
        isLoading,
        isError,
    } = useQuery<Event[]>({
        queryKey: ["events", characterId],
        queryFn: () => fetchEvents(characterId),
        enabled: !!characterId,
    });

    return (
        <main className="min-h-screen relative bg-gray-100">
            <VStack
                gap={4}
                width="full"
                className="max-w-[95%] lg:max-w-4xl"
                mx="auto"
            >
                {/* Header */}
                <HStack justify="end" width="full">
                    <Button
                        size="sm"
                        onClick={() => {
                            router.push(`/characters/${characterId}/events/create`)
                            console.log("New scenario for character", characterId);
                        }}
                    >
                        + New Event
                    </Button>
                </HStack>

                {/* Loading */}
                {isLoading && (
                    <HStack justify="center" width="full" py={20}>
                        <Spinner size="lg" />
                    </HStack>
                )}

                {/* Error */}
                {isError && (
                    <Box
                        bg="white"
                        p={6}
                        borderRadius="md"
                        borderWidth="1px"
                        width="full"
                    >
                        <Text color="red.500">Failed to load events.</Text>
                    </Box>
                )}

                {/* Empty */}
                {!isLoading && !isError && (events?.length ?? 0) === 0 && (
                    <Card.Root width="full" p={6} borderWidth="1px">
                        <Card.Body>
                            <Text>No events yet for this character.</Text>
                            <Text fontSize="sm" color="gray.600" mt={1}>
                                Use the “New Event button above to start building one.
                            </Text>
                        </Card.Body>
                    </Card.Root>
                )}

                {/* Events grid */}
                {!isLoading && !isError && (events?.length ?? 0) > 0 && (
                    <SimpleGrid
                        columns={{ base: 1, md: 2, lg: 3 }}
                        gap={4}
                        width="full"
                    >
                        {events!.map((event) => (
                            <Card.Root
                                key={event.id}
                                borderWidth="1px"
                                borderRadius="md"
                                className="hover:shadow-md transition"
                            >
                                <Card.Body>
                                    <VStack align="start" gap={2}>
                                        <Heading size="sm">
                                            {event.title}
                                        </Heading>

                                        <Text fontSize="xs" color="gray.600">
                                            Created{" "}
                                            {new Date(event.created_at).toLocaleString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Text>

                                        <Text fontSize="xs" color="gray.500">
                                            {event.scenarios.length} scenario
                                            {event.scenarios.length === 1 ? "" : "s"}
                                        </Text>

                                        <Button
                                            size="xs"
                                            variant="outline"
                                            mt={2}
                                            onClick={() =>
                                                // later: go to page where you manage scenarios for this event
                                                router.push(
                                                    `/characters/${characterId}/events/${event.id}`,
                                                )
                                            }
                                        >
                                            View scenarios
                                        </Button>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>
                        ))}
                    </SimpleGrid>
                )}
            </VStack>
        </main>
    );
}