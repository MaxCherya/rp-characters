"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { fetchEvent } from "@/endpoints/events";
import { Event, Scenario } from "@/types/events";

import {
    Box,
    Button,
    HStack,
    Spinner,
    Stack,
    Text,
    VStack,
    Badge,
} from "@chakra-ui/react";
import { StoryViewer } from "@/components/stories/StoryViewer";

/* ---------------------- Helpers: weighted choice ---------------------- */

function weightedChoice(items: Scenario[]): Scenario | null {
    if (!items.length) return null;
    const total = items.reduce((sum, s) => sum + s.weight, 0);
    const r = Math.random() * total;
    let acc = 0;
    for (const s of items) {
        acc += s.weight;
        if (r <= acc) return s;
    }
    return items[items.length - 1]; // fallback
}

type PlayResult =
    | {
        triggered: false;
        steps: [];
        reason: string;
    }
    | {
        triggered: true;
        steps: Scenario[];
        reason: string;
    };

function simulateEvent(event: Event): PlayResult {
    // 1) Check trigger
    const roll = Math.random() * 100; // 0–99.999…
    const chance = event.chance_to_trigger;

    if (roll >= chance) {
        return {
            triggered: false,
            steps: [],
            reason: `Event did not trigger (rolled ${roll.toFixed(
                1,
            )} vs chance ${chance}%).`,
        };
    }

    // 2) Build map id -> scenario
    const scenarioMap = new Map<number, Scenario>();
    event.scenarios.forEach((s) => scenarioMap.set(s.id, s));

    // 3) Start from root scenarios (no parent)
    const roots = event.scenarios.filter((s) => s.parent === null);
    if (!roots.length) {
        return {
            triggered: true,
            steps: [],
            reason: "Event triggered, but there are no root scenarios configured.",
        };
    }

    const steps: Scenario[] = [];
    let current: Scenario | null = weightedChoice(roots);

    while (current) {
        steps.push(current);

        if (current.is_terminal) break;

        // Resolve children from IDs to full objects
        const childrenFull = current.children
            .map((child) => scenarioMap.get(child.id))
            .filter((c): c is Scenario => Boolean(c));

        if (!childrenFull.length) break;

        current = weightedChoice(childrenFull);
    }

    return {
        triggered: true,
        steps,
        reason: "Event triggered successfully.",
    };
}

/* ----------------------------- Coin UI ----------------------------- */

type CoinState = "idle" | "flipping" | "result";

type CoinProps = {
    state: CoinState;
    triggered: boolean | null;
};

const Coin: React.FC<CoinProps> = ({ state, triggered }) => {
    // Simple CSS spin to feel like a coin flip
    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={`
                    w-20 h-20 md:w-24 md:h-24 rounded-full 
                    flex items-center justify-center 
                    border border-gray-300 bg-white shadow-md
                    text-lg font-semibold
                    transition-transform
                    ${state === "flipping" ? "animate-spin" : ""}
                `}
            >
                {state === "idle" && "Tap Play"}
                {state === "flipping" && "Flipping"}
                {state === "result" &&
                    (triggered ? "SUCCESS" : "FAIL")}
            </div>
            {state === "result" && triggered != null && (
                <Badge
                    colorPalette={triggered ? "green" : "red"}
                    variant="subtle"
                >
                    {triggered ? "Event triggered" : "Event not triggered"}
                </Badge>
            )}
        </div>
    );
};

/* ---------------------------- Page ---------------------------- */

export default function PlayEvent() {
    const params = useParams<{ id: string; eventId: string }>();
    const router = useRouter();

    const characterId = Number(params.id);
    const eventId = Number(params.eventId);

    const { data: event, isLoading, isError, error } = useQuery<Event>({
        queryKey: ["event", characterId, eventId],
        queryFn: () => fetchEvent(characterId, eventId),
        enabled: !Number.isNaN(characterId) && !Number.isNaN(eventId),
    });

    const [coinState, setCoinState] = useState<CoinState>("idle");
    const [triggered, setTriggered] = useState<boolean | null>(null);
    const [playResult, setPlayResult] = useState<PlayResult | null>(null);

    const canPlay = useMemo(
        () => !!event && coinState !== "flipping",
        [event, coinState],
    );

    const handlePlay = () => {
        if (!event || !canPlay) return;

        // reset
        setPlayResult(null);
        setTriggered(null);
        setCoinState("flipping");

        // fake animation delay
        setTimeout(() => {
            const result = simulateEvent(event);
            setPlayResult(result);
            setTriggered(result.triggered);
            setCoinState("result");
        }, 900); // ~1 second spin
    };

    const handlePrint = () => {
        if (typeof window === "undefined") return;
        window.print();
    };

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </main>
        );
    }

    if (isError || !event) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Text color="red.500">
                    {(error as any)?.message || "Failed to load event"}
                </Text>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex px-4 justify-center mb-7 bg-gray-100">
            <Box className="w-full max-w-4xl space-y-8">

                <VStack align="start" gap={1}>
                    <Text fontSize="3xl" fontWeight="bold">
                        {event.title}
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                        Chance to trigger:{" "}
                        <strong>{event.chance_to_trigger}%</strong>
                    </Text>
                </VStack>

                {/* Coin + play controls */}
                <VStack gap={4} align="center" mt={4}>
                    <Coin state={coinState} triggered={triggered} />

                    <Button
                        size="md"
                        colorPalette="green"
                        onClick={handlePlay}
                        disabled={!canPlay}
                    >
                        {coinState === "flipping"
                            ? "Rolling..."
                            : playResult
                                ? "Play again"
                                : "Play"}
                    </Button>

                    {playResult && (
                        <Text fontSize="sm" color="gray.600">
                            {playResult.reason}
                        </Text>
                    )}
                </VStack>

                {/* Print button */}
                <HStack justify="space-between" align="center" mt={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                        Outcome
                    </Text>
                    <Button
                        size="sm"
                        colorPalette="blue"
                        onClick={handlePrint}
                        disabled={!playResult}
                    >
                        Print as PDF
                    </Button>
                </HStack>

                {!playResult ? (
                    <Text color="gray.500" fontSize="sm">
                        Press <strong>Play</strong> to see what happens.
                    </Text>
                ) : !playResult.triggered ? (
                    <Text color="gray.700" fontSize="sm">
                        The event did not trigger this time. Try again.
                    </Text>
                ) : playResult.steps.length === 0 ? (
                    <Text color="gray.700" fontSize="sm">
                        The event triggered, but there were no scenarios to follow.
                    </Text>
                ) : (
                    <Stack gap={3}>
                        {playResult.steps.map((step, idx) => (
                            <Box
                                key={step.id}
                                borderWidth="1px"
                                borderRadius="md"
                                p={3}
                                bg="gray.50"
                            >
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                    Step {idx + 1}: {step.title}
                                </Text>

                                <StoryViewer markdown={step.description ?? ""} />
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>
        </main>
    );
}