/**
 * User page types and form rules.
 *
 * Functionality:
 * - AppUser is a user exactly as OneEngine.Api returns it (GET /api/Users, GET /api/Users/{id}).
 * - userSchema validates the Add / Edit User form: user name, domain, time zone, at least one
 *   role and a home URL are required.
 * - The *Option types are the rows of the dropdown / checkbox lists the form loads from the API.
 */
import { z } from 'zod';
import { identifier } from '@/utils/validators';
import type { BaseEntity } from '@/types/common.types';

export interface AppUser extends BaseEntity {
  userID: number;
  userName: string;

  domainID: number;
  domainName: string;

  timeZoneID: number;
  timeZoneName: string;

  homeUrlID: number;
  homeUrl: string;

  /** Role ids as the API stores them: "1,2". */
  allowedRoles?: string;
  roleIds?: string[];

  isActive?: boolean;

  modifiedBy: string;
  modifiedOn: string;

  isDeleted: boolean;
}

export const userSchema = z.object({
  userName: identifier('User Name', 100),
  domainId: z.string().min(1, 'Domain Name is required'),
  timeZone: z.string().min(1, 'Time Zone is required'),
  homeUrl: z.string().min(1, 'Home URL is required'),
  roleIds: z.array(z.string()).min(1, 'Select at least one role'),
});

export type UserFormValues = z.infer<typeof userSchema>;

/** GET /api/domains row. */
export interface DomainOption {
  domainID: number;
  domainName: string;
}

/** GET /api/UserRoles row. */
export interface RoleOption {
  roleID: number;
  roleName: string;
  isDeleted?: boolean;
}

/** GET /api/timezones row. */
export interface TimeZoneOption {
  timezoneID: number;
  timezoneName: string;
}

/** POST /api/menu/byUserRole row: a page the selected roles can open. */
export interface HomeUrlOption {
  menuID: number;
  menuName: string;
  menuUrl: string;
}
