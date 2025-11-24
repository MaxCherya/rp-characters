import { apiFetch } from "@/lib/endpoints/apiFetch";
import { baseUrl } from "@/lib/endpoints/constants";
import { getCookie } from "@/lib/endpoints/cookies";
import { flattenDrfErrors } from "@/lib/endpoints/flatterDrfErrors";
import { Character, CharacterFormValues } from "@/types/characters";

/**
 * Fetch list of the current user's characters.
 *
 * GET /api/characters/
 */
export const fetchCharacters = async (): Promise<Character[]> => {
  const res = await apiFetch(`${baseUrl}/api/characters/`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to fetch characters";
    try {
      const json = raw ? JSON.parse(raw) : null;
      message = json ? flattenDrfErrors(json) : raw || message;
    } catch {
      message = raw || message;
    }
    throw new Error(message);
  }

  return res.json();
};

/**
 * Fetch a single character by id.
 *
 * GET /api/characters/:id/
 */
export const fetchCharacter = async (id: number): Promise<Character> => {
  const res = await apiFetch(`${baseUrl}/api/characters/${id}/`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to fetch character";
    try {
      const json = raw ? JSON.parse(raw) : null;
      message = json ? flattenDrfErrors(json) : raw || message;
    } catch {
      message = raw || message;
    }
    throw new Error(message);
  }

  return res.json();
};

/**
 * Create a new character.
 *
 * POST /api/characters/
 */
export const createCharacter = async (
  data: CharacterFormValues,
): Promise<Character> => {
  const csrftoken = getCookie("csrftoken");

  const res = await apiFetch(`${baseUrl}/api/characters/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken || "",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to create character";
    try {
      const json = raw ? JSON.parse(raw) : null;
      message = json ? flattenDrfErrors(json) : raw || message;
    } catch {
      message = raw || message;
    }
    throw new Error(message);
  }

  return res.json();
};

/**
 * Update an existing character (full or partial depending on your use).
 *
 * PUT /api/characters/:id/
 * or PATCH if you change method here & on backend.
 */
export const updateCharacter = async (
  id: number,
  data: CharacterFormValues,
): Promise<Character> => {
  const csrftoken = getCookie("csrftoken");

  const res = await apiFetch(`${baseUrl}/api/characters/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken || "",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to update character";
    try {
      const json = raw ? JSON.parse(raw) : null;
      message = json ? flattenDrfErrors(json) : raw || message;
    } catch {
      message = raw || message;
    }
    throw new Error(message);
  }

  return res.json();
};

/**
 * Delete a character.
 *
 * DELETE /api/characters/:id/
 */
export const deleteCharacter = async (id: number): Promise<void> => {
  const csrftoken = getCookie("csrftoken");

  const res = await apiFetch(`${baseUrl}/api/characters/${id}/`, {
    method: "DELETE",
    headers: {
      "X-CSRFToken": csrftoken || "",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to delete character";
    try {
      const json = raw ? JSON.parse(raw) : null;
      message = json ? flattenDrfErrors(json) : raw || message;
    } catch {
      message = raw || message;
    }
    throw new Error(message);
  }
};