import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { ICON_OPTIONS, ICON_REGISTRY, type IconKey } from './iconRegistry';
import { AppSelect } from './AppSelect';

function IconOption({ value, label }: { value: IconKey; label: string }) {
  const Icon = ICON_REGISTRY[value].icon;
  return (
    <span className="flex items-center gap-2">
      <Icon size={16} /> {label}
    </span>
  );
}

interface IconSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  required?: boolean;
}

export function IconSelect<T extends FieldValues>({
  control,
  name,
  label = 'Icon',
  required,
}: IconSelectProps<T>) {
  return (
    <AppSelect
      control={control}
      name={name}
      label={label}
      required={required}
      placeholder="Select Icon"
      options={ICON_OPTIONS}
      optionRender={(option) => (
        <IconOption value={option.value as IconKey} label={String(option.label)} />
      )}
      labelRender={(option) =>
        option.value ? (
          <IconOption value={option.value as IconKey} label={String(option.label)} />
        ) : null
      }
    />
  );
}
