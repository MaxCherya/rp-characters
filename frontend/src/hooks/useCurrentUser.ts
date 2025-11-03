"use client";

import { fetchCurrentUser } from "@/endpoints/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useCurrentUser() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["me"],
        queryFn: fetchCurrentUser,
        staleTime: 5 * 60 * 1000, // 5 min
    });

    const clearUser = () => {
        queryClient.setQueryData(["me"], null);
    };

    return { ...query, clearUser };
}