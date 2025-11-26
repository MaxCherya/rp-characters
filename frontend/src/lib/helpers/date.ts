export function toDateInputValueFromDotted(raw?: string | null): string {
    if (!raw) return "";

    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(raw);
    if (!match) {
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return "";
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
}
