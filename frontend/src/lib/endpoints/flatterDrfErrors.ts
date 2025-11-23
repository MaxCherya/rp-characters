/**
 * Converts Django REST Framework error objects into a flat readable string.
 * 
 * Example input:
 *   { username: ["Username is taken."], email: ["Email is already in use."] }
 * Output:
 *   "Username: Username is taken. • Email: Email is already in use."
 */
export function flattenDrfErrors(data: unknown): string {
    if (!data || typeof data !== "object") return "Request failed";

    const parts: string[] = [];
    for (const [key, value] of Object.entries(data)) {
        const messages = Array.isArray(value) ? value.join(", ") : String(value);
        const label =
            key === "non_field_errors" || key === "detail"
                ? "Error"
                : key.charAt(0).toUpperCase() + key.slice(1);
        parts.push(`${label}: ${messages}`);
    }

    return parts.join(" • ");
}