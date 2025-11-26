import { CountryOption } from "@/types/external";


export const fetchCountriesOptions = async (): Promise<CountryOption[]> => {
  const res = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,cca2"
  );

  if (!res.ok) {
    throw new Error("Failed to fetch countries list");
  }

  const raw = await res.json() as Array<{
    name: { common: string };
    cca2: string;
  }>;

  const mapped: CountryOption[] = raw.map((c) => ({
    code: c.cca2,
    name: c.name.common,
  }));

  mapped.sort((a, b) => a.name.localeCompare(b.name));

  return mapped;
};