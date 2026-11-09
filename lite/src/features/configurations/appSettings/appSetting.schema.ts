import { z } from 'zod';
import type { BaseEntity } from '@/types/common.types';
import { identifier, optionalText, requiredText } from '@/utils/validators';

/**
 * Application setting. For secret settings the backend stores the value encrypted and never
 * returns it (`appValue` is null); sending an empty value on update keeps the stored one.
 */
export interface AppSetting extends BaseEntity {
  appKey: string;
  appValue: string | null;
  isSecret: boolean;
}

/** `keepExistingSecret`: editing a secret, so an empty value means "unchanged". */
export const makeAppSettingSchema = (keepExistingSecret: boolean) =>
  z.object({
    appKey: identifier('App Key', 100),
    appValue: keepExistingSecret
      ? optionalText('App Value', 2000)
      : requiredText('App Value', 2000),
    isSecret: z.boolean(),
  });

export type AppSettingFormValues = z.infer<ReturnType<typeof makeAppSettingSchema>>;
