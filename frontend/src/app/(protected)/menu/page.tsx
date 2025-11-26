'use client'

import { FullScreenLoader } from "@/components/ui/fullScreenLoader";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AbsoluteCenter, Button, ButtonGroup, Heading, VStack } from "@chakra-ui/react"
import { useRouter } from "next/navigation";
import { RiArrowRightLine } from "react-icons/ri"

export default function Menu() {
    const { data: user, isLoading } = useCurrentUser();
    const router = useRouter();

    if (isLoading) return <FullScreenLoader />;
    if (!user) return <p>You’re not logged in</p>;

    return (
        <main className="min-h-screen relative">
            <AbsoluteCenter>
                <VStack gap={6}>
                    <Heading size="lg">Welcome, {user.username}</Heading>
                    <ButtonGroup className="flex flex-col">
                        <Button onClick={() => router.push('/my-characters')} variant='solid' className="w-full">My Characters <RiArrowRightLine /></Button>
                        <Button onClick={() => router.push('/create-character')} variant='solid' className="w-full">Create a New Character <RiArrowRightLine /></Button>
                        <Button onClick={() => router.push('/account/settings')} variant='solid' className="w-full">Account Settings <RiArrowRightLine /></Button>
                    </ButtonGroup>
                </VStack>
            </AbsoluteCenter>
        </main>
    );
}