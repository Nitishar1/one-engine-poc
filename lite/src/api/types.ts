/** Every API response is wrapped in this envelope: `{ success, data, message }`. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Error thrown by the API client. `message` is always safe to show to the user. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

export interface LoginRequest {
  domain: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

/**
 * One sidebar entry, sent by the backend. An item with `children` is a group; an item with
 * `path` opens a page. `icon` is a name from src/layout/menu.tsx.
 */
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
}

export interface Configuration {
  id: string;
  key: string;
  value: string;
  description: string;
  updatedOn: string;
}

/** Fields the user can edit; the backend sets `id` and `updatedOn`. */
export type ConfigurationInput = Pick<Configuration, 'key' | 'value' | 'description'>;
