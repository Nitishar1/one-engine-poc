import type { AiAgentConfig, AiModel } from '@/features/aiAgents/types/ai.types';

export const aiModelsSeed: AiModel[] = [
  {
    id: 'aim_cohere',
    name: 'Cohere Command R+',
    provider: 'OCI Generative AI',
    modelId: 'cohere.command-r-plus',
    endpoint: 'https://inference.generativeai.ap-mumbai-1.oci.oraclecloud.com',
    maxTokens: 4000,
    temperature: 0.3,
    status: 'Active',
    modifiedBy: 'SuperUser',
    modifiedOn: '2026-04-18T10:12:00',
  },
  {
    id: 'aim_llama',
    name: 'Meta Llama 3.1 70B',
    provider: 'OCI Generative AI',
    modelId: 'meta.llama-3.1-70b-instruct',
    endpoint: 'https://inference.generativeai.ap-mumbai-1.oci.oraclecloud.com',
    maxTokens: 8000,
    temperature: 0.2,
    status: 'Active',
    modifiedBy: 'SuperUser',
    modifiedOn: '2026-04-18T10:20:00',
  },
  {
    id: 'aim_local',
    name: 'On-Prem Extractor',
    provider: 'On-Premise',
    modelId: 'oe-extractor-v2',
    endpoint: 'http://10.131.33.157:8501',
    maxTokens: 2048,
    temperature: 0,
    status: 'Inactive',
    modifiedBy: 'admin',
    modifiedOn: '2026-05-01T15:30:00',
  },
];

const PREREQUISITES = '1.Oracle Cloud account 2.OCI Generative AI 3.Streamlit';

export const aiAgentsSeed: AiAgentConfig[] = [
  {
    id: 'aia_sum',
    name: 'Summarization',
    kind: 'summarization',
    icon: 'globe',
    modelId: 'aim_cohere',
    shortDescription: 'To condense long texts, audio, or video into shorter.',
    fullDescription:
      'Hardware 8 core processor - Multi-processor enabled • Virtual Machine 16 GB or greater RAM 320 GB Data Drive Require 3 + 3 Servers for Web, Application & Database • Recommended Software Windows Server 2016 or above. .NET Framework 4.7.2 or above. IIS 10 and above. PowerShell 5.1 or above. Microsoft SQL Server 2019 or above. SSL Certificate for OneEngine Web Portal Access Necessary API access to perform incident management activities in ITSM tool (Create, assign, update & close) Dedicated Service Account for ITSM tool API Access PowerShell WinRM – Port 5985/5986 and SSH 22 Ports to be enabled SMTP Relay access for sending mails.',
    prerequisites: PREREQUISITES,
    modifiedBy: 'SuperUser',
    modifiedOn: '2026-04-19T09:00:00',
  },
  {
    id: 'aia_extract',
    name: 'Data Extractor',
    kind: 'extraction',
    icon: 'gear',
    modelId: 'aim_llama',
    shortDescription: 'Data extraction AI agent is an intelligent software system',
    fullDescription: 'intelligent software system',
    prerequisites: PREREQUISITES,
    modifiedBy: 'SuperUser',
    modifiedOn: '2026-04-19T09:10:00',
  },
];
