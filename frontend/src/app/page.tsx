'use client';

import { Container, Heading, Text } from "@chakra-ui/react";

export default function Home() {
  return (
    <Container centerContent className="min-h-screen justify-center bg-white">
      <Heading size={'6xl'} color={'black'}>RP Characters</Heading>
      <Text color={"blackAlpha.700"}>RP Characters - create/generate unique characters for your stories.</Text>
    </Container>
  );
}
