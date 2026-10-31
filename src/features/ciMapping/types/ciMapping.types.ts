import type { BaseEntity } from '@/types/common.types';
import type { IconKey } from '@/components/common/iconRegistry';

export interface CiType extends BaseEntity {
  name: string;
  icon: IconKey;
}

export type CiEnvironment = 'Production' | 'Staging' | 'Development' | 'DR';
export type CiStatus = 'Active' | 'Inactive' | 'Maintenance';

export interface CiMaster extends BaseEntity {
  name: string;
  ciTypeId: string;
  hostName: string;
  ipAddress: string;
  operatingSystem: string;
  environment: CiEnvironment;
  status: CiStatus;
}

export type CiRelationshipType = 'Depends On' | 'Hosts' | 'Connects To' | 'Runs On' | 'Backs Up';

export interface CiRelationship extends BaseEntity {
  sourceCiId: string;
  targetCiId: string;
  relationshipType: CiRelationshipType;
  description: string;
}
