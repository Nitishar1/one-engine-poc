import { useMemo } from 'react';
import { ciMasterHooks, ciTypeHooks } from './useCiMapping';

/** Id → name lookups used by grids that reference other CI entities. */
export function useCiLookups() {
  const types = ciTypeHooks.useList();
  const masters = ciMasterHooks.useList();

  return useMemo(() => {
    const typeName = new Map((types.data ?? []).map((t) => [t.id, t.name]));
    const ciName = new Map((masters.data ?? []).map((c) => [c.id, c.name]));
    return {
      types: types.data ?? [],
      masters: masters.data ?? [],
      typeName: (id: string) => typeName.get(id) ?? 'Unknown',
      ciName: (id: string) => ciName.get(id) ?? 'Unknown',
      isLoading: types.isLoading || masters.isLoading,
    };
  }, [types.data, masters.data, types.isLoading, masters.isLoading]);
}
