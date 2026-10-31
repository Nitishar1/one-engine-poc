import { createCrudService } from '@/services/api/crudService';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import type { CiMaster, CiRelationship, CiType } from '../types/ciMapping.types';

export const ciTypeService = createCrudService<CiType>(API_ENDPOINTS.ciTypes);
export const ciMasterService = createCrudService<CiMaster>(API_ENDPOINTS.ciMasters);
export const ciRelationshipService = createCrudService<CiRelationship>(
  API_ENDPOINTS.ciRelationships,
);
