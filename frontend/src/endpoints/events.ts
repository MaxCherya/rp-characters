import { apiFetch } from "@/lib/endpoints/apiFetch";
import { baseUrl } from "@/lib/endpoints/constants";
import { getCookie } from "@/lib/endpoints/cookies";
import { flattenDrfErrors } from "@/lib/endpoints/flatterDrfErrors";
import {
  Event,
  EventFormValues,
  Scenario,
  ScenarioFormValues,
} from "@/types/events";

/**
 * Fetch list of events.
 *
 * GET /api/events/
 */
export const fetchEvents = async (): Promise<Event[]> => {
  const res = await apiFetch(`${baseUrl}/api/events/`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to fetch events";
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
 * Fetch a single event by id.
 *
 * GET /api/events/:id/
 */
export const fetchEvent = async (id: number): Promise<Event> => {
  const res = await apiFetch(`${baseUrl}/api/events/${id}/`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to fetch event";
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
 * Create a new event.
 *
 * POST /api/events/
 */
export const createEvent = async (
  data: EventFormValues,
): Promise<Event> => {
  const csrftoken = getCookie("csrftoken");

  const res = await apiFetch(`${baseUrl}/api/events/`, {
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
    let message = "Failed to create event";
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
 * Update an existing event.
 *
 * PUT /api/events/:id/
 */
export const updateEvent = async (
  id: number,
  data: EventFormValues,
): Promise<Event> => {
  const csrftoken = getCookie("csrftoken");

  const res = await apiFetch(`${baseUrl}/api/events/${id}/`, {
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
    let message = "Failed to update event";
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
 * Delete an event.
 *
 * DELETE /api/events/:id/
 */
export const deleteEvent = async (id: number): Promise<void> => {
  const csrftoken = getCookie("csrftoken");

  const res = await apiFetch(`${baseUrl}/api/events/${id}/`, {
    method: "DELETE",
    headers: {
      "X-CSRFToken": csrftoken || "",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to delete event";
    try {
      const json = raw ? JSON.parse(raw) : null;
      message = json ? flattenDrfErrors(json) : raw || message;
    } catch {
      message = raw || message;
    }
    throw new Error(message);
  }
};

/* -------------------------------------------------- */
/*                 SCENARIO ENDPOINTS                 */
/* -------------------------------------------------- */

/**
 * Fetch scenarios for a given event.
 *
 * GET /api/events/:event_id/scenarios/
 */
export const fetchEventScenarios = async (
  eventId: number,
): Promise<Scenario[]> => {
  const res = await apiFetch(
    `${baseUrl}/api/events/${eventId}/scenarios/`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to fetch scenarios";
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
 * Create a new scenario for a given event.
 *
 * POST /api/events/:event_id/scenarios/
 */
export const createEventScenario = async (
  eventId: number,
  data: ScenarioFormValues,
): Promise<Scenario> => {
  const csrftoken = getCookie("csrftoken");

  const res = await apiFetch(
    `${baseUrl}/api/events/${eventId}/scenarios/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken || "",
      },
      body: JSON.stringify(data),
      credentials: "include",
    },
  );

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to create scenario";
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
 * Fetch a single scenario by id.
 *
 * GET /api/events/scenarios/:id/
 */
export const fetchScenario = async (id: number): Promise<Scenario> => {
  const res = await apiFetch(
    `${baseUrl}/api/events/scenarios/${id}/`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to fetch scenario";
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
 * Update an existing scenario.
 *
 * PUT /api/events/scenarios/:id/
 */
export const updateScenario = async (
  id: number,
  data: ScenarioFormValues,
): Promise<Scenario> => {
  const csrftoken = getCookie("csrftoken");

  const res = await apiFetch(
    `${baseUrl}/api/events/scenarios/${id}/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken || "",
      },
      body: JSON.stringify(data),
      credentials: "include",
    },
  );

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to update scenario";
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
 * Delete a scenario.
 *
 * DELETE /api/events/scenarios/:id/
 */
export const deleteScenario = async (id: number): Promise<void> => {
  const csrftoken = getCookie("csrftoken");

  const res = await apiFetch(
    `${baseUrl}/api/events/scenarios/${id}/`,
    {
      method: "DELETE",
      headers: {
        "X-CSRFToken": csrftoken || "",
      },
      credentials: "include",
    },
  );

  if (!res.ok) {
    const raw = await res.text();
    let message = "Failed to delete scenario";
    try {
      const json = raw ? JSON.parse(raw) : null;
      message = json ? flattenDrfErrors(json) : raw || message;
    } catch {
      message = raw || message;
    }
    throw new Error(message);
  }
};