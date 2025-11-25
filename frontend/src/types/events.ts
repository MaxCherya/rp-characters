export type Scenario = {
  id: number;
  event: number;
  parent: number | null;
  title: string;
  description: string;
  weight: number;
  is_terminal: boolean;
  children: number[];
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
  scenarios: Scenario[];
};