'use client'

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AbsoluteCenter, Button, ButtonGroup, Heading, VStack } from "@chakra-ui/react"
import { useRouter } from "next/navigation";
import { RiArrowRightLine } from "react-icons/ri"

export default function Menu() {
    const { data: user, isLoading } = useCurrentUser();
    const router = useRouter();

    if (isLoading) return <p>Loading...</p>;
    if (!user) return <p>You’re not logged in</p>;

    return (
        <main className="min-h-screen relative">
            <AbsoluteCenter>
                <VStack gap={6}>
                    <Heading size="lg">Welcome, {user.username}</Heading>
                    <ButtonGroup className="flex flex-col">
                        <Button onClick={() => router.push('/my-characters')} variant='solid' className="w-full">My Characters <RiArrowRightLine /></Button>
                        <Button colorPalette='red' variant='solid' className="w-full">Logout</Button>
                    </ButtonGroup>
                </VStack>
            </AbsoluteCenter>
        </main>
    );
}