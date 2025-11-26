'use client';

import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Button,
  Flex,
} from "@chakra-ui/react";
import { motion, MotionConfig } from "framer-motion";
import { useRouter } from "next/navigation";

const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionBox = motion(Box);

export default function Home() {

  const router = useRouter();

  return (
    <MotionConfig reducedMotion="user">
      <Box
        minH="100dvh"
        bg="white"
        color="black"
        position="relative"
        overflow="hidden"
        fontFamily="'Courier New', Courier, monospace"
      >
        {/* Subtle paper texture */}
        <Box
          position="absolute"
          inset={0}
          opacity={0.05}
          backgroundImage="url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.06%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        />

        {/* Full viewport centering using Flex (works perfectly on all screens) */}
        <Flex
          minH="100dvh"
          alignItems="center"
          justifyContent="center"
          px={{ base: 6, md: 8 }}
          py={{ base: 12, md: 16 }}
        >
          <VStack
            gap={{ base: 10, md: 14, lg: 16 }}
            textAlign="center"
            maxW="container.lg"
            w="full"
          >
            {/* Title */}
            <MotionHeading
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              fontSize={{ base: "5xl", sm: "6xl", md: "8xl", lg: "9xl" }}
              fontWeight="400"
              letterSpacing={{ base: "0.1em", md: "0.2em" }}
              textTransform="uppercase"
              lineHeight="0.9"
            >
              RP Characters
            </MotionHeading>

            {/* Subtitle */}
            <MotionText
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1.8 }}
              fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
              opacity={0.8}
              letterSpacing="wide"
              lineHeight={{ base: "2", md: "2.4" }}
              fontWeight="300"
            >
              Create your role-play character from scratch.
              <br />
              Flesh out their past, their secrets, their voice.
              <br />
              <Text as="span" opacity={0.45} fontSize={{ base: "xs", md: "sm" }} letterSpacing="widest">
                One soul. One story. Written by you.
              </Text>
            </MotionText>

            {/* Typewriter line + blinking cursor */}
            <MotionBox
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.6, duration: 1.4 }}
              w={{ base: "180px", md: "240px" }}
              h="1px"
              bg="black"
              opacity={0.7}
              mt={{ base: 6, md: 8 }}
            />

            <MotionText
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="bold"
              lineHeight="1"
            >
              _
            </MotionText>

            {/* CTA Button */}
            <Button
              mt={{ base: 10, md: 14 }}
              size="lg"
              variant="outline"
              borderWidth="2px"
              borderColor="black"
              color="black"
              bg="transparent"
              _hover={{
                bg: "black",
                color: "white",
                transform: "translateY(-2px)",
              }}
              fontFamily="inherit"
              fontSize={{ base: "sm", md: "md" }}
              letterSpacing={{ base: "0.15em", md: "0.2em" }}
              px={{ base: 8, md: 12 }}
              py={{ base: 6, md: 7 }}
              fontWeight="400"
              textTransform="uppercase"
              transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              onClick={() => router.push('/auth')}
            >
              Create Your First Character
            </Button>
          </VStack>
        </Flex>

        {/* Floating ink particles */}
        {[...Array(6)].map((_, i) => (
          <MotionBox
            key={i}
            position="absolute"
            width="1px"
            height="40px"
            bg="black"
            opacity="0.06"
            initial={{ y: -100 }}
            animate={{ y: "110dvh" }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
            left={`${10 + i * 14}%`}
            top="-40px"
          />
        ))}
      </Box>
    </MotionConfig>
  );
}