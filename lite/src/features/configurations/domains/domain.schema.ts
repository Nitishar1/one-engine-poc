import { z } from 'zod';
import type { BaseEntity } from '@/types/common.types';
import { identifier, requiredText } from '@/utils/validators';

export interface Domain extends BaseEntity {
  domainName: string;
  domainPath: string;
  distinguishedName: string;
  isAdDomain: boolean;
}

/** DC=corp,DC=example,DC=com */
const DN_PATTERN = /^[A-Za-z]+=[^,=]+(,[A-Za-z]+=[^,=]+)*$/;

export const domainSchema = z
  .object({
    domainName: identifier('Domain Name', 60),
    domainPath: requiredText('Domain Path', 255).refine(
      (v) => /^[A-Za-z0-9.-]+$/.test(v),
      'Domain Path may contain letters, digits, dots and hyphens only',
    ),
    distinguishedName: requiredText('Distinguished Name', 255),
    isAdDomain: z.boolean(),
  })
  .refine((v) => !v.isAdDomain || DN_PATTERN.test(v.distinguishedName), {
    path: ['distinguishedName'],
    message: 'For an AD domain use the form DC=corp,DC=example,DC=com',
  });

export type DomainFormValues = z.infer<typeof domainSchema>;
