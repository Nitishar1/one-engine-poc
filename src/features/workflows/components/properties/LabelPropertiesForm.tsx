import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppInput } from '@/components/common/AppInput';
import { requiredText } from '@/utils/validators';
import type { WorkflowNodeDataMap } from '../../types/workflow.types';
import { PROPERTIES_FORM_ID, type NodePropertiesFormProps } from './types';

const schema = z.object({ label: requiredText('Label', 40) });
type Values = z.infer<typeof schema>;

/** Start and End steps only carry a label. */
export function LabelPropertiesForm<K extends 'start' | 'end'>({
  node,
  onApply,
}: NodePropertiesFormProps<K>) {
  const { control, handleSubmit } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { label: node.data.label },
  });
  return (
    <form
      id={PROPERTIES_FORM_ID}
      onSubmit={handleSubmit((values) => onApply(values as Partial<WorkflowNodeDataMap[K]>))}
      className="flex flex-col gap-5"
      noValidate
    >
      <AppInput control={control} name="label" label="Label" required />
    </form>
  );
}
