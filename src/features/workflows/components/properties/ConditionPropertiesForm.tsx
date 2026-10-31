import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppInput } from '@/components/common/AppInput';
import { requiredText } from '@/utils/validators';
import { PROPERTIES_FORM_ID, type NodePropertiesFormProps } from './types';

const schema = z.object({
  label: requiredText('Label', 40),
  expression: requiredText('Expression', 500),
});
type Values = z.infer<typeof schema>;

export function ConditionPropertiesForm({ node, onApply }: NodePropertiesFormProps<'condition'>) {
  const { control, handleSubmit } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { label: node.data.label, expression: node.data.expression },
  });
  return (
    <form
      id={PROPERTIES_FORM_ID}
      onSubmit={handleSubmit(onApply)}
      className="flex flex-col gap-5"
      noValidate
    >
      <AppInput control={control} name="label" label="Label" required />
      <AppInput
        control={control}
        name="expression"
        label="Expression"
        required
        kind="textarea"
        rows={3}
        className="[&_textarea]:font-mono"
        placeholder="output.statusCode == 200"
        hint="Evaluated against the previous step's output. True follows the Yes branch, false follows No."
      />
    </form>
  );
}
