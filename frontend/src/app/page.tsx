'use client';

import { Button, Container, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function Home() {
  return (
    <Container minH={'100dvh'} centerContent justifyContent={'center'}>
      <Heading size={{ base: '5xl' }}>RP Characters</Heading>
      <Text textStyle={{ base: 'xs' }} textAlign={{ base: 'center' }}>RP Characters - create/generate unique characters for your stories.</Text>
      <Button size={{ base: 'xs' }} asChild marginTop={'8'} colorPalette={'blue'}><Link href={'/auth'}>Getting Started</Link></Button>
    </Container>
  );
}