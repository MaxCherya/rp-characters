import { baseUrl } from "./constants";

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Refreshes the access token using the refresh cookie.
 * Ensures only one refresh request runs at a time.
 */
async function refreshToken(): Promise<void> {
    if (!refreshPromise) {
        isRefreshing = true;
        refreshPromise = fetch(`${baseUrl}/api/accounts/refresh/`, {
            method: "POST",
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error("Refresh failed");
            })
            .finally(() => {
                isRefreshing = false;
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

/**
 * A universal fetch wrapper that:
 * - Automatically includes credentials (cookies)
 * - Handles any HTTP method or content type
 * - Tries to refresh JWT cookies once on 401
 * - Redirects to /auth if refresh fails
 *
 * @param endpoint - Relative or absolute URL (auto-prepended with baseUrl if relative)
 * @param options - Standard Fetch API options
 * @returns A Fetch Response object
 */
export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
        credentials: "include",
        ...options,
    };

    const res = await fetch(url, defaultOptions);

    if (res.status === 401) {
        try {
            await refreshToken();
            const retry = await fetch(url, defaultOptions);
            if (retry.status === 401) throw new Error("Unauthorized again");
            return retry;
        } catch (err) {
            console.warn("Session expired:", err);
            window.location.href = "/auth";
            throw err;
        }
    }

    return res;
}