import { useState, type KeyboardEvent } from 'react';
import { Alert, Button, Checkbox, Input, Select } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Globe, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { getErrorMessage } from '@/utils/helpers';
import { toast } from '@/components/feedback/toastStore';
import { FormField } from '@/components/common/FormField';
import { useDomains, useLogin } from '../hooks/useAuth';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schemas';
import { TermsModal } from './TermsModal';

interface LoginFormProps {
  notice?: string;
  termsOpen: boolean;
  onOpenTerms: () => void;
  onCloseTerms: () => void;
}

export function LoginForm({ notice, termsOpen, onOpenTerms, onCloseTerms }: LoginFormProps) {
  const domains = useDomains();
  const login = useLogin();
  const [capsLock, setCapsLock] = useState(false);

  const { control, handleSubmit, setValue, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { domain: '', username: '', password: '', acceptTerms: false },
  });
  const { errors } = formState;

  const onSubmit = handleSubmit(({ domain, username, password }) =>
    login.mutate(
      { domain, username, password },
      { onSuccess: ({ user }) => void toast.success(`Welcome back, ${user.displayName}`) },
    ),
  );

  const trackCapsLock = (e: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(e.getModifierState?.('CapsLock') ?? false);

  return (
    <form onSubmit={onSubmit} noValidate className="oe-login-form flex flex-col gap-4">
      {notice && <Alert type="warning" showIcon title={notice} />}
      {login.isError && (
        <Alert
          type="error"
          showIcon
          title={getErrorMessage(login.error)}
          className="oe-animate-in"
        />
      )}

      <Controller
        control={control}
        name="domain"
        render={({ field }) => (
          <FormField label="Domain" htmlFor="login-domain" error={errors.domain?.message}>
            <Select
              id="login-domain"
              size="large"
              placeholder="Select your domain"
              value={field.value || undefined}
              onChange={field.onChange}
              onBlur={field.onBlur}
              loading={domains.isLoading}
              disabled={login.isPending}
              options={(domains.data ?? []).map((d) => ({ label: d, value: d }))}
              prefix={<Globe size={15} />}
              status={errors.domain ? 'error' : undefined}
              className="!w-full"
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="username"
        render={({ field }) => (
          <FormField label="User name" htmlFor="login-username" error={errors.username?.message}>
            <Input
              {...field}
              id="login-username"
              size="large"
              placeholder="e.g. jdoe"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              disabled={login.isPending}
              prefix={<UserRound size={15} />}
              status={errors.username ? 'error' : undefined}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <FormField
            label="Password"
            htmlFor="login-password"
            error={errors.password?.message}
            hint={capsLock ? 'Caps Lock is on' : undefined}
          >
            <Input.Password
              {...field}
              id="login-password"
              size="large"
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={login.isPending}
              onKeyUp={trackCapsLock}
              onKeyDown={trackCapsLock}
              prefix={<LockKeyhole size={15} />}
              status={errors.password ? 'error' : undefined}
            />
          </FormField>
        )}
      />

      <div className="pt-1">
        <Controller
          control={control}
          name="acceptTerms"
          render={({ field }) => (
            <Checkbox
              checked={field.value}
              disabled={login.isPending}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              aria-describedby="login-terms-link"
            >
              <span className="text-[13px] text-fg-secondary">I agree to the </span>
            </Checkbox>
          )}
        />
        <button
          id="login-terms-link"
          type="button"
          className="-ml-1.5 cursor-pointer border-0 bg-transparent p-0 text-[13px] font-medium text-fg underline decoration-[var(--oe-border-strong)] underline-offset-[3px] transition-colors hover:decoration-current"
          onClick={onOpenTerms}
        >
          Terms and Conditions
        </button>
        {errors.acceptTerms?.message && (
          <span role="alert" className="oe-animate-in mt-1.5 block text-[12.5px] text-danger">
            {errors.acceptTerms.message}
          </span>
        )}
      </div>

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        loading={login.isPending}
        className="group mt-2 !h-11 !font-medium"
        iconPlacement="end"
        icon={
          login.isPending ? undefined : (
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          )
        }
      >
        {login.isPending ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="m-0 mt-2 flex items-center justify-center gap-1.5 text-[12px] text-fg-muted">
        <ShieldCheck size={13} />
        Access is restricted to authorised users and audited.
      </p>

      <TermsModal
        open={termsOpen}
        onClose={onCloseTerms}
        onAccept={() => {
          setValue('acceptTerms', true, { shouldValidate: true });
          onCloseTerms();
        }}
      />
    </form>
  );
}
