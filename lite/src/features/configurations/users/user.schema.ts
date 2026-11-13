import { z } from 'zod';
import type { BaseEntity } from '@/types/common.types';
import { identifier } from '@/utils/validators';

/**
 * A user as the page works with it. Ids are kept as strings (select / checkbox values);
 * user.api.ts converts to and from the OneEngine.Api shape (`userID`, `domainID`, ...).
 */
export interface AppUser extends BaseEntity {
  userName: string;
  domainId: string;
  timeZoneId: string;
  /** Page opened after sign-in: a menu URL allowed for the user's roles. */
  homeUrl: string;
  /** Menu id of the home URL ('' when unknown). */
  homeUrlId: string;
  /** Role ids (the API sends them as `allowedRoles`, a comma-separated string). */
  roleIds: string[];
  isActive: boolean;
}

export const userSchema = z.object({
  userName: identifier('User Name', 100),
  domainId: z.string().min(1, 'Domain Name is required'),
  timeZoneId: z.string().min(1, 'Time Zone is required'),
  roleIds: z.array(z.string()).min(1, 'Select at least one role'),
  homeUrlId: z.string().min(1, 'Home URL is required'),
  isActive: z.boolean(),
});

export type UserFormValues = z.infer<typeof userSchema>;

/** Option lists for the user form, as the API returns them. */
export interface DomainOption {
  domainID: number | string;
  domainName: string;
}
export interface RoleOption {
  roleID: number | string;
  roleName: string;
}
export interface TimeZoneOption {
  timezoneID: number | string;
  timezoneName: string;
}
export interface HomeUrlOption {
  menuID: number | string;
  menuName: string;
  menuUrl: string;
}
