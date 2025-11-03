'use client'

import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Menu() {
    const { data: user, isLoading } = useCurrentUser();

    if (isLoading) return <p>Loading...</p>;
    if (!user) return <p>You’re not logged in</p>;

    return (
        <main className="min-h-screen bg-background text-text-primary centered-display py-8">
            <h1>Welcome, {user.username}</h1>
        </main>
    )
}