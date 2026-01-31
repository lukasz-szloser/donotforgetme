export interface PackingItem {
  id: string;
  title: string;
  description?: string;
  checked: boolean;
  parentId?: string | null;
  order: number;
  userId: string;
  listId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackingList {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  shared: boolean;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}
