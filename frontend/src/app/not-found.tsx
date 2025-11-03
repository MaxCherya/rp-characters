'use client';

import { Center, Heading, Text } from "@chakra-ui/react";

export default function Custom404() {
    return (
        <Center h={'100svh'} className="flex flex-col items-center justify-center">
            <Heading size={{ base: 'xl', lg: '6xl' }}>404 | Not Found</Heading>
            <Text textStyle={{ base: 'sm', lg: 'md' }}>The page you were looking for does not exist.</Text>
        </Center >
    );
}