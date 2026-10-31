import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppInput, AppNumberInput } from '@/components/common/AppInput';
import { requiredText } from '@/utils/validators';
import { PROPERTIES_FORM_ID, type NodePropertiesFormProps } from './types';

const schema = z.object({
  label: requiredText('Label', 40),
  seconds: z.number({ error: 'Duration is required' }).int().min(1).max(86400),
});
type Values = z.infer<typeof schema>;

export function DelayPropertiesForm({ node, onApply }: NodePropertiesFormProps<'delay'>) {
  const { control, handleSubmit } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { label: node.data.label, seconds: node.data.seconds },
  });
  return (
    <form
      id={PROPERTIES_FORM_ID}
      onSubmit={handleSubmit(onApply)}
      className="flex flex-col gap-5"
      noValidate
    >
      <AppInput control={control} name="label" label="Label" required />
      <AppNumberInput
        control={control}
        name="seconds"
        label="Wait (seconds)"
        required
        min={1}
        max={86400}
      />
    </form>
  );
}
