import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CrudListPage } from '@/components/common/CrudListPage';
import { MaskedValue } from '@/components/common/MaskedValue';
import { ROUTES } from '@/config/routes';
import { appSettingHooks } from './appSetting.api';
import type { AppSetting } from './appSetting.schema';

const COLUMNS: ColumnsType<AppSetting> = [
  { title: 'App Key', dataIndex: 'appKey', sorter: (a, b) => a.appKey.localeCompare(b.appKey) },
  {
    title: 'App Value',
    dataIndex: 'appValue',
    ellipsis: true,
    render: (value: string | null, row) => (row.isSecret ? <MaskedValue /> : value),
  },
  {
    title: 'Type',
    dataIndex: 'isSecret',
    render: (isSecret: boolean) => (isSecret ? <Tag color="gold">Secret</Tag> : <Tag>Plain</Tag>),
  },
];

const nameOf = (row: AppSetting) => row.appKey;
const searchValues = (row: AppSetting) => [row.appKey, row.isSecret ? '' : row.appValue];

export default function AppSettingListPage() {
  return (
    <CrudListPage
      title="AppSetting Parameters"
      description="Key / value settings read by OneEngine services. Secret values are stored encrypted and never shown."
      entityLabel="AppSetting"
      listPath={ROUTES.appSettings}
      hooks={appSettingHooks}
      columns={COLUMNS}
      nameOf={nameOf}
      searchValues={searchValues}
    />
  );
}
