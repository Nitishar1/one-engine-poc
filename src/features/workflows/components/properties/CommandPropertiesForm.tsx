import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { ciMasterHooks } from '@/features/ciMapping/hooks/useCiMapping';
import { requiredText } from '@/utils/validators';
import { PROPERTIES_FORM_ID, type NodePropertiesFormProps } from './types';

const schema = z.object({
  label: requiredText('Label', 40),
  shell: z.enum(['PowerShell', 'Shell']),
  target: z.string().min(1, 'Target is required'),
  command: requiredText('Command', 4000),
});
type Values = z.infer<typeof schema>;

export function CommandPropertiesForm({ node, onApply }: NodePropertiesFormProps<'command'>) {
  const cis = ciMasterHooks.useList();
  const { control, handleSubmit } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: node.data.label,
      shell: node.data.shell,
      target: node.data.target,
      command: node.data.command,
    },
  });
  return (
    <form
      id={PROPERTIES_FORM_ID}
      onSubmit={handleSubmit(onApply)}
      className="flex flex-col gap-5"
      noValidate
    >
      <AppInput control={control} name="label" label="Label" required />
      <AppSelect
        control={control}
        name="shell"
        label="Shell"
        required
        options={[
          { label: 'PowerShell (WinRM)', value: 'PowerShell' },
          { label: 'Shell (SSH)', value: 'Shell' },
        ]}
      />
      <AppSelect
        control={control}
        name="target"
        label="Target CI"
        required
        placeholder="Select target"
        loading={cis.isLoading}
        options={(cis.data ?? []).map((c) => ({
          label: `${c.name} (${c.ipAddress})`,
          value: c.name,
        }))}
      />
      <AppInput
        control={control}
        name="command"
        label="Command"
        required
        kind="textarea"
        rows={6}
        spellCheck={false}
        className="[&_textarea]:font-mono [&_textarea]:text-[13px]"
      />
    </form>
  );
}
