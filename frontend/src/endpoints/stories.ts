import { apiFetch } from "@/lib/endpoints/apiFetch";
import { baseUrl } from "@/lib/endpoints/constants";
import { getCookie } from "@/lib/endpoints/cookies";
import { flattenDrfErrors } from "@/lib/endpoints/flatterDrfErrors";
import { Story, StoryFormValues } from "@/types/stories";

/**
 * Fetch all stories for a given character (current user).
 *
 * GET /api/stories/list/:character_id
 */
export const fetchStories = async (characterId: number): Promise<Story[]> => {
  const res = await apiFetch(`${baseUrl}/api/stories/list/${characterId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to fetch stories";
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
 * Fetch a single story by id.
 *
 * GET /api/stories/:id/
 */
export const fetchStory = async (id: number): Promise<Story> => {
  const res = await apiFetch(`${baseUrl}/api/stories/${id}/`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to fetch story";
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
 * Create a new story for a specific character.
 *
 * POST /api/stories/list/:character_id
 */
export const createStory = async (
  characterId: number,
  data: StoryFormValues,
): Promise<Story> => {
  const csrftoken = getCookie("csrftoken");

  const res = await apiFetch(`${baseUrl}/api/stories/list/${characterId}`, {
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
    let message = "Failed to create story";
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
 * Update an existing story (full or partial depending on your use).
 *
 * PUT /api/stories/:id/
 * (Change to PATCH if you prefer partial updates.)
 */
export const updateStory = async (
  id: number,
  data: StoryFormValues,
): Promise<Story> => {
  const csrftoken = getCookie("csrftoken");

  const res = await apiFetch(`${baseUrl}/api/stories/${id}/`, {
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
    let message = "Failed to update story";
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
 * Delete a story.
 *
 * DELETE /api/stories/:id/
 */
export const deleteStory = async (id: number): Promise<void> => {
  const csrftoken = getCookie("csrftoken");

  const res = await apiFetch(`${baseUrl}/api/stories/${id}/`, {
    method: "DELETE",
    headers: {
      "X-CSRFToken": csrftoken || "",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to delete story";
    try {
      const json = raw ? JSON.parse(raw) : null;
      message = json ? flattenDrfErrors(json) : raw || message;
    } catch {
      message = raw || message;
    }
    throw new Error(message);
  }
};