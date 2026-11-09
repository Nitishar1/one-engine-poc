import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CrudListPage } from '@/components/common/CrudListPage';
import { ROUTES } from '@/config/routes';
import { domainHooks } from './domain.api';
import type { Domain } from './domain.schema';

const COLUMNS: ColumnsType<Domain> = [
  {
    title: 'Domain Name',
    dataIndex: 'domainName',
    sorter: (a, b) => a.domainName.localeCompare(b.domainName),
  },
  { title: 'Domain Path', dataIndex: 'domainPath' },
  { title: 'Distinguished Name', dataIndex: 'distinguishedName', ellipsis: true },
  {
    title: 'AD Domain',
    dataIndex: 'isAdDomain',
    render: (isAd: boolean) => (isAd ? <Tag color="blue">Yes</Tag> : <Tag>No</Tag>),
  },
];

const nameOf = (row: Domain) => row.domainName;
const searchValues = (row: Domain) => [row.domainName, row.domainPath, row.distinguishedName];

export default function DomainListPage() {
  return (
    <CrudListPage
      title="Domains"
      description="Sign-in domains. AD domains authenticate against Active Directory."
      entityLabel="Domain"
      listPath={ROUTES.domains}
      hooks={domainHooks}
      columns={COLUMNS}
      nameOf={nameOf}
      searchValues={searchValues}
    />
  );
}
