import { Modal, type ModalProps } from 'antd';

/** Modal with OneEngine defaults: centered, unmounts on close, never wider than the viewport. */
export function AppModal({ width = 560, ...props }: ModalProps) {
  return (
    <Modal
      centered
      destroyOnHidden
      mask={{ closable: false }}
      width={typeof width === 'number' ? `min(${width}px, calc(100vw - 32px))` : width}
      {...props}
    />
  );
}
