"use client";

import { useState } from "react";
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "next-themes";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            value={{ light: "chakra-theme-light", dark: "chakra-theme-dark" }}
        >
            <QueryClientProvider client={queryClient}>
                <ChakraProvider value={defaultSystem}><Toaster />{children}</ChakraProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}