import { useState } from 'react';
import {
  Alert,
  App,
  Button,
  Input,
  Popconfirm,
  Space,
  Table,
  Typography,
  type TableProps,
} from 'antd';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { configurationApi } from '../../api/configurationApi';
import type { Configuration } from '../../api/types';
import { useApi } from '../../hooks/useApi';
import { ConfigurationModal } from './ConfigurationModal';

export default function ConfigurationsPage() {
  const { message } = App.useApp();
  const configurations = useApi(configurationApi.list);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Configuration | 'new' | null>(null);

  const term = search.trim().toLowerCase();
  const rows = (configurations.data ?? []).filter((c) =>
    `${c.key} ${c.value} ${c.description}`.toLowerCase().includes(term),
  );

  const remove = async (item: Configuration) => {
    try {
      await configurationApi.remove(item.id);
      message.success('Configuration deleted');
      configurations.reload();
    } catch (e) {
      message.error((e as Error).message);
    }
  };

  const columns: TableProps<Configuration>['columns'] = [
    { title: 'Key', dataIndex: 'key', sorter: (a, b) => a.key.localeCompare(b.key) },
    { title: 'Value', dataIndex: 'value' },
    { title: 'Description', dataIndex: 'description' },
    {
      title: 'Updated',
      dataIndex: 'updatedOn',
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      render: (_, item) => (
        <Space>
          <Button
            size="small"
            icon={<Pencil size={14} />}
            onClick={() => setEditing(item)}
            aria-label="Edit"
          />
          <Popconfirm
            title="Delete this configuration?"
            okText="Delete"
            onConfirm={() => remove(item)}
          >
            <Button size="small" danger icon={<Trash2 size={14} />} aria-label="Delete" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <Typography.Title level={3}>Configurations</Typography.Title>
        <Space>
          <Input.Search
            placeholder="Search"
            allowClear
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setEditing('new')}>
            Add
          </Button>
        </Space>
      </div>

      {configurations.error && (
        <Alert
          type="error"
          showIcon
          title={configurations.error}
          action={<Button onClick={configurations.reload}>Retry</Button>}
          className="page-alert"
        />
      )}

      <Table rowKey="id" columns={columns} dataSource={rows} loading={configurations.loading} />

      <ConfigurationModal
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          configurations.reload();
        }}
      />
    </>
  );
}
