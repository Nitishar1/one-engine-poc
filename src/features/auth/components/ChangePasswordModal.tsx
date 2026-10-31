import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppModal } from '@/components/common/AppModal';
import { AppInput } from '@/components/common/AppInput';
import { useChangePassword } from '../hooks/useAuth';
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas/auth.schemas';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const EMPTY: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const changePassword = useChangePassword();
  const { control, handleSubmit, reset } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY,
  });

  const close = () => {
    reset(EMPTY);
    onClose();
  };

  const onSubmit = handleSubmit(({ currentPassword, newPassword }) =>
    changePassword.mutate({ currentPassword, newPassword }, { onSuccess: close }),
  );

  return (
    <AppModal
      title="Change Password"
      open={open}
      onCancel={close}
      onOk={() => void onSubmit()}
      okText="Update Password"
      confirmLoading={changePassword.isPending}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4 pt-2" noValidate>
        <AppInput
          control={control}
          name="currentPassword"
          label="Current Password"
          kind="password"
          required
          autoComplete="current-password"
        />
        <AppInput
          control={control}
          name="newPassword"
          label="New Password"
          kind="password"
          required
          autoComplete="new-password"
          hint="At least 8 characters with upper and lower case letters, a number and a symbol."
        />
        <AppInput
          control={control}
          name="confirmPassword"
          label="Confirm Password"
          kind="password"
          required
          autoComplete="new-password"
        />
        <button type="submit" hidden />
      </form>
    </AppModal>
  );
}
