export type Story = {
  id: number;
  character: number;
  owner: string | null;
  title: string;
  description: string;
  markdown: string | null;
  created: string;
  updated: string;
};

export type StoryFormValues = {
  title: string;
  description?: string;
  markdown?: string | null;
};