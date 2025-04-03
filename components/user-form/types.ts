export type UserState = {
  name: string;
  age: string;
  email: string;
  isActive: boolean;
  lastEdit?: number;
};

export type UserWithId = UserState & { id: string };


