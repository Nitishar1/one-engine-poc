import dayjs from 'dayjs';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import type { AuthUser, LoginRequest } from '@/features/auth/types/auth.types';
import type {
  AiAgentConfig,
  AiAgentRunRequest,
  AiAgentRunResult,
  AiModel,
} from '@/features/aiAgents/types/ai.types';
import type { Agent } from '@/features/agentRepository/types/agent.types';
import type { CiMaster, CiRelationship, CiType } from '@/features/ciMapping/types/ciMapping.types';
import type { DashboardSummary } from '@/features/dashboard/types/dashboard.types';
import type { Runbook } from '@/features/workflows/types/workflow.types';
import { MockCollection } from '../mockDb';
import { ciMastersSeed, ciRelationshipsSeed, ciTypesSeed } from '../data/ciMapping.data';
import { agentsSeed } from '../data/agents.data';
import { aiAgentsSeed, aiModelsSeed } from '../data/ai.data';
import { runbookRolesSeed, runbooksSeed } from '../data/runbooks.data';
import { generateExecutions } from '../data/executions.data';
import { crudRoutes } from './crudHandlers';
import { estimateTokens, extract, summarize } from './aiEngine';
import { fail, ok, type MockRoute } from './types';

const db = {
  ciTypes: new MockCollection<CiType>('ciTypes', ciTypesSeed),
  ciMasters: new MockCollection<CiMaster>('ciMasters', ciMastersSeed),
  ciRelationships: new MockCollection<CiRelationship>('ciRelationships', ciRelationshipsSeed),
  agents: new MockCollection<Agent>('agents', agentsSeed),
  aiModels: new MockCollection<AiModel>('aiModels', aiModelsSeed),
  aiAgents: new MockCollection<AiAgentConfig>('aiAgents', aiAgentsSeed),
  runbooks: new MockCollection<Runbook>('runbooks', runbooksSeed),
};

const executions = generateExecutions();

/** Simulates the httpOnly session cookie the real backend would set. */
const SESSION_KEY = 'oneengine-mock-session';

export const mockSession = {
  get: () => sessionStorage.getItem(SESSION_KEY),
  set: (username: string) => sessionStorage.setItem(SESSION_KEY, username),
  clear: () => sessionStorage.removeItem(SESSION_KEY),
};

const DOMAINS = ['LOCAL', 'DOMAIN'];

const buildUser = (username: string, domain: string): AuthUser => ({
  id: `usr_${username.toLowerCase()}`,
  username,
  displayName: username,
  role: 'Admin',
  domain,
  lastLogin: dayjs().subtract(6, 'hour').second(30).toISOString(),
  timezone: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi',
});

const sessionPayload = (username: string, domain = DOMAINS[0]) => ({
  user: buildUser(username, domain),
  accessToken: `mock.${btoa(username)}.${Date.now()}`,
});

const authRoutes: MockRoute[] = [
  { method: 'GET', pattern: API_ENDPOINTS.auth.domains, public: true, handler: () => ok(DOMAINS) },
  {
    method: 'POST',
    pattern: API_ENDPOINTS.auth.login,
    public: true,
    handler: ({ body }) => {
      const { domain, username, password } = body as LoginRequest;
      if (!DOMAINS.includes(domain)) return fail(400, 'Select a valid domain');
      if (!username?.trim() || !password) return fail(400, 'User name and password are required');
      if (password.toLowerCase() === 'invalid') return fail(401, 'Invalid user name or password');
      mockSession.set(username.trim());
      return ok(sessionPayload(username.trim(), domain));
    },
  },
  {
    method: 'GET',
    pattern: API_ENDPOINTS.auth.session,
    public: true,
    handler: () => {
      const username = mockSession.get();
      return username ? ok(sessionPayload(username)) : fail(401, 'No active session');
    },
  },
  {
    method: 'POST',
    pattern: API_ENDPOINTS.auth.logout,
    handler: () => {
      mockSession.clear();
      return ok(null);
    },
  },
  {
    method: 'POST',
    pattern: API_ENDPOINTS.auth.changePassword,
    handler: ({ body }) => {
      const { currentPassword, newPassword } = body as {
        currentPassword: string;
        newPassword: string;
      };
      if (currentPassword === newPassword)
        return fail(400, 'New password must differ from the current password');
      return ok(null, 'Password changed successfully');
    },
  },
];

const dashboardRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: API_ENDPOINTS.dashboard.summary,
    handler: () => {
      const days = Array.from({ length: 14 }, (_, i) => dayjs().subtract(13 - i, 'day'));
      const dailyExecutions = days.map((day) => {
        const sameDay = executions.filter((e) => dayjs(e.startedOn).isSame(day, 'day'));
        return {
          date: day.format('DD MMM'),
          success: sameDay.filter((e) => e.status === 'Success').length,
          failed: sameDay.filter((e) => e.status === 'Failed').length,
        };
      });
      const finished = executions.filter((e) => e.status !== 'Running');
      const summary: DashboardSummary = {
        totals: {
          agents: db.agents.all().length,
          aiAgents: db.aiAgents.all().length,
          runbooks: db.runbooks.all().length,
          configurationItems: db.ciMasters.all().length,
        },
        successRate: Math.round(
          (finished.filter((e) => e.status === 'Success').length / finished.length) * 100,
        ),
        dailyExecutions,
        recentExecutions: executions.slice(0, 8),
      };
      return ok(summary);
    },
  },
  {
    method: 'GET',
    pattern: API_ENDPOINTS.reports.executions,
    handler: ({ query }) => {
      const from = query.from ? dayjs(query.from).startOf('day') : null;
      const to = query.to ? dayjs(query.to).endOf('day') : null;
      return ok(
        executions.filter(
          (e) =>
            (!query.status || e.status === query.status) &&
            (!from || !dayjs(e.startedOn).isBefore(from)) &&
            (!to || !dayjs(e.startedOn).isAfter(to)),
        ),
      );
    },
  },
];

const aiRoutes: MockRoute[] = [
  {
    method: 'POST',
    pattern: '/ai-agents/:id/run',
    handler: ({ params, body }) => {
      const agent = db.aiAgents.find(params.id);
      if (!agent) return fail(404, 'AI agent not found');
      const model = db.aiModels.find(agent.modelId);
      if (!model) return fail(422, 'The AI model configured for this agent no longer exists');
      if (model.status !== 'Active') return fail(422, `AI model "${model.name}" is inactive`);

      const { input } = body as AiAgentRunRequest;
      const started = performance.now();
      const result: AiAgentRunResult = {
        output: '',
        modelName: model.name,
        durationMs: 0,
        tokensUsed: 0,
      };

      if (agent.kind === 'summarization') {
        result.output = summarize(input);
      } else if (agent.kind === 'extraction') {
        result.fields = extract(input);
        result.output = result.fields.length
          ? `Extracted ${result.fields.length} field(s) from the supplied content.`
          : 'No structured fields were detected in the supplied content.';
      } else {
        result.output = input;
      }
      result.durationMs = Math.round(performance.now() - started) + 600;
      result.tokensUsed = estimateTokens(input) + estimateTokens(result.output);
      return ok(result);
    },
  },
];

const usedBy = <T>(items: T[], predicate: (item: T) => boolean, message: string) =>
  items.some(predicate) ? message : null;

export const mockRoutes: MockRoute[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...aiRoutes,
  { method: 'GET', pattern: API_ENDPOINTS.runbookRoles, handler: () => ok(runbookRolesSeed) },
  ...crudRoutes(API_ENDPOINTS.ciTypes, db.ciTypes, {
    label: 'CI Type',
    uniqueField: 'name',
    canDelete: (id) =>
      usedBy(
        db.ciMasters.all(),
        (c) => c.ciTypeId === id,
        'CI Type is in use by one or more configuration items',
      ),
  }),
  ...crudRoutes(API_ENDPOINTS.ciMasters, db.ciMasters, {
    label: 'Configuration item',
    uniqueField: 'name',
    canDelete: (id) =>
      usedBy(
        db.ciRelationships.all(),
        (r) => r.sourceCiId === id || r.targetCiId === id,
        'Configuration item is used in one or more relationships',
      ),
  }),
  ...crudRoutes(API_ENDPOINTS.ciRelationships, db.ciRelationships, { label: 'CI Relationship' }),
  ...crudRoutes(API_ENDPOINTS.agents, db.agents, { label: 'Agent', uniqueField: 'name' }),
  ...crudRoutes(API_ENDPOINTS.aiModels, db.aiModels, {
    label: 'AI Model',
    uniqueField: 'name',
    canDelete: (id) =>
      usedBy(db.aiAgents.all(), (a) => a.modelId === id, 'AI Model is used by an AI agent'),
  }),
  ...crudRoutes(API_ENDPOINTS.aiAgents, db.aiAgents, { label: 'AI Agent', uniqueField: 'name' }),
  ...crudRoutes(API_ENDPOINTS.runbooks, db.runbooks, { label: 'Runbook', uniqueField: 'name' }),
];
