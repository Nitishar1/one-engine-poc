export type EntityId = string;

/** Audit fields shared by every persisted entity in OneEngine. */
export interface AuditFields {
  modifiedBy: string;
  modifiedOn: string;
}

export interface BaseEntity extends AuditFields {
  id: EntityId;
}

/** Payload for create/update calls: everything except server-managed fields. */
export type EntityInput<T extends BaseEntity> = Omit<T, keyof BaseEntity>;

export interface SelectOption<V extends string | number = string> {
  label: string;
  value: V;
}
