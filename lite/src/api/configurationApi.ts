import { api } from './client';
import { ENDPOINTS, withId } from './endpoints';
import type { Configuration, ConfigurationInput } from './types';

export const configurationApi = {
  list: () => api.get<Configuration[]>(ENDPOINTS.configurations),
  create: (input: ConfigurationInput) => api.post<Configuration>(ENDPOINTS.configurations, input),
  update: (id: string, input: ConfigurationInput) =>
    api.put<Configuration>(withId(ENDPOINTS.configurations, id), input),
  remove: (id: string) => api.delete<null>(withId(ENDPOINTS.configurations, id)),
};
