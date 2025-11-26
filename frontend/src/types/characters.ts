export type BasicIdentityPayload = {
  name_given: string;
  name_family: string;
  name_middle?: string;
  date_of_birth?: string | null;
};

export type LocationPayload = {
  country: string;
  state_province: string;
  zip_code: string;
  settlement: string;
  street: string;
  house: string;
  appartment: string;
};

export type CharacterFormValues = {
  basic_identity: BasicIdentityPayload;
  location: LocationPayload;
};

export type Character = {
  id: number;
  basic_identity: BasicIdentityPayload;
  location: LocationPayload;
};