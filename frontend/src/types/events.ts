export type ScenarioChild = {
  id: number;
  title: string;
};

export type Scenario = {
  id: number;
  event: number;
  parent: number | null;
  title: string;
  description: string;
  weight: number;
  is_terminal: boolean;
  children: ScenarioChild[];
};

export type ScenarioFormValues = {
  parent: number | null;
  title: string;
  description: string;
  weight: number;
  is_terminal: boolean;
};

export type EventFormValues = {
  title: string;
  description: string;
  chance_to_trigger: number;
};

export type Event = EventFormValues & {
  id: number;
  character: number;
  owner: string | null;
  created_at: string;
  last_modified: string;
  scenarios: Scenario[];
};