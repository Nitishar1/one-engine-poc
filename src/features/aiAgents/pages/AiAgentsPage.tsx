import { PageHeader } from '@/components/common/PageHeader';
import { AiAgentCollection } from '../components/AiAgentCollection';

export default function AiAgentsPage() {
  return (
    <>
      <PageHeader
        title="AI Agents"
        description="Pick an agent to open its workspace and run it against your own content."
      />
      <AiAgentCollection />
    </>
  );
}
