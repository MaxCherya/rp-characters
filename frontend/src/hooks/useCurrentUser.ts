"use client";

import { fetchCurrentUser } from "@/endpoints/auth";
import { User } from "@/types/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useCurrentUser() {
    const queryClient = useQueryClient();

    let storedUser: User | null = null;
    if (typeof window !== "undefined") {
        const raw = localStorage.getItem("me");
        if (raw) {
            try {
                storedUser = JSON.parse(raw);
            } catch {
                storedUser = null;
            }
        }
    }

    const query = useQuery({
        queryKey: ["me"],
        queryFn: fetchCurrentUser,
        enabled: !storedUser,
        initialData: storedUser ?? undefined,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (query.data) {
            localStorage.setItem("me", JSON.stringify(query.data));
        }
    }, [query.data]);

    const clearUser = () => {
        queryClient.setQueryData(["me"], null);
        localStorage.removeItem("me");
    };

    return { ...query, clearUser };
}