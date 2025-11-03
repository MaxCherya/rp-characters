'use client';

import React, { useState } from "react";
import { Center, For, SegmentGroup } from "@chakra-ui/react";
import LoginForm from "@/components/auth/LoginCard";
import RegistrationForm from "@/components/auth/RegistrationCard";

const Auth: React.FC = () => {
    const [mode, setMode] = useState<"Login" | "Registration">("Login");

    return (
        <Center minH="100svh" flexDir="column" gap="8">
            <SegmentGroup.Root
                className="!fixed !bottom-5"
                value={mode}
                onValueChange={(e: any) => setMode(e.value)}
            >
                <SegmentGroup.Indicator />
                <For each={["Login", "Registration"]}>
                    {(item) => (
                        <SegmentGroup.Item key={item} value={item}>
                            <SegmentGroup.ItemText
                                _checked={{
                                    color: "black",
                                    fontWeight: "semibold"
                                }}
                                color={'blackAlpha.600'}
                            >
                                {item}
                            </SegmentGroup.ItemText>
                            <SegmentGroup.ItemHiddenInput />
                        </SegmentGroup.Item>
                    )}
                </For>

            </SegmentGroup.Root>

            {mode === "Login" ? <LoginForm /> : <RegistrationForm setMode={setMode} />}
        </Center>
    );
};

export default Auth;
