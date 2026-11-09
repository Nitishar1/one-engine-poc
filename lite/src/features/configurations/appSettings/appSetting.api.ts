import { createCrudHooks } from '@/hooks/useCrudQueries';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { createCrudService } from '@/services/api/crudService';
import type { AppSetting } from './appSetting.schema';

export const appSettingService = createCrudService<AppSetting>(API_ENDPOINTS.appSettings);
export const appSettingHooks = createCrudHooks('app-settings', appSettingService, 'App setting');
