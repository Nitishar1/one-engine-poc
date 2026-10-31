import { Tabs } from 'antd';
import { Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { AppButton } from '@/components/common/AppButton';
import { AiAgentCollection } from '@/features/aiAgents/components/AiAgentCollection';
import { ROUTES } from '@/config/routes';
import { AgentCollection } from '../components/AgentCollection';

const TABS = ['agents', 'ai-agents', 'others'] as const;
type TabKey = (typeof TABS)[number];

export default function AgentRepositoryPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab: TabKey = TABS.includes(tabParam as TabKey) ? (tabParam as TabKey) : 'agents';

  return (
    <>
      <PageHeader
        title="Agent Repository"
        description="Reusable scripts and AI agents that runbooks orchestrate across your estate."
        actions={
          <AppButton
            icon={<Plus size={15} />}
            onClick={() =>
              navigate(tab === 'ai-agents' ? ROUTES.aiConfigurationNew : ROUTES.agentNew)
            }
          >
            {tab === 'ai-agents' ? 'Add AI Agent' : 'Add Agent'}
          </AppButton>
        }
      />
      <Tabs
        className="oe-pill-tabs"
        activeKey={tab}
        onChange={(key) => setParams({ tab: key }, { replace: true })}
        items={[
          { key: 'agents', label: 'Agents', children: <AgentCollection category="agents" /> },
          {
            key: 'ai-agents',
            label: 'AI Agents',
            children: <AiAgentCollection linkLabel="Open workspace" />,
          },
          { key: 'others', label: 'Others', children: <AgentCollection category="others" /> },
        ]}
      />
    </>
  );
}
