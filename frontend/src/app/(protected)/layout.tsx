'use client';

import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useEffect } from 'react';
import { Providers } from '../providers';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { data: user, isLoading } = useCurrentUser();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth');
        }
    }, [isLoading, user, router]);

    if (isLoading) {
        return (
            <div className="centered-display h-screen">
                <p>Checking session...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <Providers>{children}</Providers>
    )
}