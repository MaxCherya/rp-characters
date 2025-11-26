'use client';

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePathname, useRouter } from "next/navigation";
import {
    Box,
    Flex,
    HStack,
    VStack,
    Button,
    Text,
    Avatar,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import { useMutation } from "@tanstack/react-query";
import { logoutUser } from "@/endpoints/auth";

type NavItem = {
    label: string;
    href: string;
};

const navItems: NavItem[] = [
    { label: "My Characters", href: "/my-characters" },
    { label: "Create New Character", href: "/create-character" },
    { label: "Settings", href: "/account/settings" },
];

const MotionBox = motion(Box);

export default function ProtectedNav() {
    const { data: user, isLoading, clearUser } = useCurrentUser();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const { mutateAsync: logoutMutate, isPending: isLoggingOut } = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            clearUser();
            router.push("/");
        },
    });

    const handleLogout = async () => {
        try {
            await logoutMutate();
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    if (isLoading || !user) return null;

    const name = user.first_name
        ? `${user.first_name} ${user.last_name || ""}`.trim()
        : user.username;

    const isActive = (href: string) => pathname.startsWith(href);

    const DesktopNavLink = ({ item }: { item: NavItem }) => (
        <Button
            variant="ghost"
            fontWeight={isActive(item.href) ? "bold" : "medium"}
            borderBottom={isActive(item.href) ? "2px solid black" : "none"}
            borderRadius={0}
            onClick={() => router.push(item.href)}
        >
            {item.label}
        </Button>
    );

    const MobileNavLink = ({ item }: { item: NavItem }) => (
        <Button
            variant="ghost"
            fontWeight={isActive(item.href) ? "bold" : "medium"}
            borderBottom={isActive(item.href) ? "2px solid black" : "none"}
            borderRadius={0}
            onClick={() => {
                router.push(item.href);
                setMobileOpen(false);
            }}
            justifyContent="flex-start"
            w="full"
        >
            {item.label}
        </Button>
    );

    const UserInfo = () => (
        <HStack gap={3} align="center">
            <Avatar.Root size="sm">
                <Avatar.Fallback name={name} />
            </Avatar.Root>
            <Box textAlign="left">
                <Text fontWeight="medium" fontSize="sm">
                    {name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                    {user.email}
                </Text>
            </Box>
        </HStack>
    );

    return (
        <Box
            bg="white"
            borderBottom="1px"
            borderColor="gray.200"
            top={0}
            zIndex={20}
            position="relative"
        >
            {/* Top nav bar */}
            <Flex
                maxW="7xl"
                mx="auto"
                px={6}
                py={4}
                align="center"
                justify="space-between"
            >
                {/* Logo */}
                <Text className="cursor-pointer" fontSize="2xl" onClick={() => router.push('/menu')} fontWeight="bold">RP Characters</Text>

                {/* Desktop Nav */}
                <HStack gap={8} display={{ base: "none", md: "flex" }}>
                    {navItems.map((item) => (
                        <DesktopNavLink key={item.href} item={item} />
                    ))}
                </HStack>

                {/* Desktop Right */}
                <HStack gap={6} display={{ base: "none", md: "flex" }}>
                    <UserInfo />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? "Logging out..." : "Log out"}
                    </Button>
                </HStack>

                {/* Mobile Toggle */}
                <Button
                    display={{ base: "block", md: "none" }}
                    variant="ghost"
                    onClick={() => setMobileOpen((v) => !v)}
                    p={2}
                >
                    {mobileOpen ? <HiX size={20} /> : <HiMenu size={20} />}
                </Button>
            </Flex>

            {/* Mobile Menu FULLSCREEN overlay with animation */}
            <AnimatePresence initial={false}>
                {mobileOpen && (
                    <MotionBox
                        as="section"
                        position="fixed"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="white"
                        zIndex={30}
                        display={{ base: "block", md: "none" }}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                    >
                        <Flex
                            direction="column"
                            minH="100vh"
                            px={6}
                            py={4}
                            justify="space-between"
                        >
                            {/* 1) Top: Logo + Close */}
                            <Flex align="center" justify="space-between">
                                <Text fontSize="2xl" fontWeight="bold">
                                    RP Characters
                                </Text>
                                <Button
                                    variant="ghost"
                                    onClick={() => setMobileOpen(false)}
                                    p={2}
                                >
                                    <HiX size={20} />
                                </Button>
                            </Flex>

                            {/* 2) Middle: Nav Links */}
                            <VStack align="stretch" gap={3}>
                                {navItems.map((item) => (
                                    <MobileNavLink key={item.href} item={item} />
                                ))}
                            </VStack>

                            {/* 3) Bottom: User info + Logout */}
                            <VStack align="stretch" gap={3} pb={2}>
                                <Box h="1px" bg="gray.200" />
                                <UserInfo />
                                <Button
                                    variant="outline"
                                    w="full"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? "Logging out..." : "Log out"}
                                </Button>
                            </VStack>
                        </Flex>
                    </MotionBox>
                )}
            </AnimatePresence>
        </Box>
    );
}