import { AppModal } from '@/components/common/AppModal';
import { APP_CONFIG } from '@/utils/constants';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  /** "I Agree": ticks the checkbox on the sign-in form. */
  onAccept: () => void;
}

/** Terms and Conditions shown from the sign-in page. */
export function TermsModal({ open, onClose, onAccept }: TermsModalProps) {
  return (
    <AppModal
      title="Terms and Conditions"
      open={open}
      onCancel={onClose}
      onOk={onAccept}
      okText="I Agree"
      width={640}
    >
      <div className="max-h-[50vh] overflow-y-auto pr-2 text-[14px] leading-relaxed text-fg-secondary">
        <p>
          Access to {APP_CONFIG.name} is restricted to authorised users. All activity, including
          configuration changes, runbook executions and agent invocations, is logged and may be
          audited.
        </p>
        <p>
          You must not share your credentials, attempt to bypass access controls, or run automation
          against systems you are not authorised to manage.
        </p>
        <p className="mb-0">
          Generated output is provided for assistance only and must be reviewed before it is used to
          make operational decisions.
        </p>
      </div>
    </AppModal>
  );
}
