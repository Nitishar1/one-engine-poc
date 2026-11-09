import { useEffect, useState } from 'react';
import { App, Form, Input, Modal } from 'antd';
import { configurationApi } from '../../api/configurationApi';
import type { Configuration, ConfigurationInput } from '../../api/types';

interface Props {
  /** The item to edit, `'new'` to add one, or `null` when the dialog is closed. */
  item: Configuration | 'new' | null;
  onClose: () => void;
  onSaved: () => void;
}

/** Add / edit dialog. The backend validates again; these rules are for quick feedback. */
export function ConfigurationModal({ item, onClose, onSaved }: Props) {
  const { message } = App.useApp();
  const [form] = Form.useForm<ConfigurationInput>();
  const [saving, setSaving] = useState(false);
  const isNew = item === 'new';

  useEffect(() => {
    if (item === null) return;
    form.setFieldsValue(isNew ? { key: '', value: '', description: '' } : item);
  }, [item, isNew, form]);

  const save = async (values: ConfigurationInput) => {
    setSaving(true);
    try {
      if (isNew) await configurationApi.create(values);
      else if (item) await configurationApi.update(item.id, values);
      message.success(isNew ? 'Configuration added' : 'Configuration updated');
      onSaved();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={item !== null}
      title={isNew ? 'Add configuration' : 'Edit configuration'}
      okText="Save"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={save}>
        <Form.Item
          name="key"
          label="Key"
          rules={[
            { required: true, message: 'Key is required' },
            { max: 100 },
            {
              pattern: /^[A-Za-z0-9_.-]+$/,
              message: 'Use letters, numbers, dot, dash or underscore',
            },
          ]}
        >
          <Input placeholder="e.g. mail.smtpHost" />
        </Form.Item>
        <Form.Item
          name="value"
          label="Value"
          rules={[{ required: true, message: 'Value is required' }, { max: 500 }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ max: 300 }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
