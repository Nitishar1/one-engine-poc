import { Button, type ButtonProps } from 'antd';

export type ButtonTone = 'primary' | 'secondary' | 'success' | 'danger' | 'default';

export interface AppButtonProps extends Omit<ButtonProps, 'type'> {
  /**
   * Visual weight. `primary` is the single main action on a surface; `secondary` / `default`
   * are outlined; `danger` is reserved for destructive actions. `success` is kept for API
   * compatibility and renders as a secondary button.
   */
  tone?: ButtonTone;
  htmlType?: ButtonProps['htmlType'];
}

export function AppButton({ tone = 'primary', ...props }: AppButtonProps) {
  return (
    <Button
      type={tone === 'primary' ? 'primary' : 'default'}
      danger={tone === 'danger'}
      {...props}
    />
  );
}
