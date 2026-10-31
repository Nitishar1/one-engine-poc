import { createCrudHooks } from '@/hooks/useCrudQueries';
import {
  ciMasterService,
  ciRelationshipService,
  ciTypeService,
} from '../services/ciMappingService';

export const ciTypeHooks = createCrudHooks('ci-types', ciTypeService, 'CI Type');
export const ciMasterHooks = createCrudHooks('ci-masters', ciMasterService, 'Configuration item');
export const ciRelationshipHooks = createCrudHooks(
  'ci-relationships',
  ciRelationshipService,
  'CI Relationship',
);
