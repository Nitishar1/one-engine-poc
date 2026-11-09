import { lazy, type ComponentType } from 'react';
import { Navigate, createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ROUTES } from '@/config/routes';
import RouteErrorPage from '@/features/errors/pages/RouteErrorPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RootLayout } from './RootLayout';

const page = (loader: () => Promise<{ default: ComponentType }>) => {
  const Component = lazy(loader);
  return <Component />;
};

const ciTypeList = () => import('@/features/ciMapping/pages/CiTypeListPage');
const ciTypeForm = () => import('@/features/ciMapping/pages/CiTypeFormPage');
const ciMasterList = () => import('@/features/ciMapping/pages/CiMasterListPage');
const ciMasterForm = () => import('@/features/ciMapping/pages/CiMasterFormPage');
const ciRelList = () => import('@/features/ciMapping/pages/CiRelationshipListPage');
const ciRelForm = () => import('@/features/ciMapping/pages/CiRelationshipFormPage');
const agentRepo = () => import('@/features/agentRepository/pages/AgentRepositoryPage');
const agentForm = () => import('@/features/agentRepository/pages/AgentFormPage');
const runbookBuilder = () => import('@/features/workflows/pages/RunbookBuilderPage');
const aiModelList = () => import('@/features/aiAgents/pages/AiModelListPage');
const aiModelForm = () => import('@/features/aiAgents/pages/AiModelFormPage');
const aiConfigList = () => import('@/features/aiAgents/pages/AiConfigurationListPage');
const aiConfigForm = () => import('@/features/aiAgents/pages/AiConfigurationFormPage');
const modulePending = () => import('@/features/modules/pages/ModulePendingPage');

/** Authenticated routes rendered inside the application shell. */
export const appRoutes: RouteObject[] = [
  { index: true, element: <Navigate to={ROUTES.home} replace /> },
  { path: ROUTES.home, element: page(() => import('@/features/dashboard/pages/HomePage')) },

  { path: ROUTES.ciType, element: page(ciTypeList) },
  { path: ROUTES.ciTypeNew, element: page(ciTypeForm) },
  { path: ROUTES.ciTypeEdit(), element: page(ciTypeForm) },
  { path: ROUTES.ciMaster, element: page(ciMasterList) },
  { path: ROUTES.ciMasterNew, element: page(ciMasterForm) },
  { path: ROUTES.ciMasterEdit(), element: page(ciMasterForm) },
  { path: ROUTES.ciRelationship, element: page(ciRelList) },
  { path: ROUTES.ciRelationshipNew, element: page(ciRelForm) },
  { path: ROUTES.ciRelationshipEdit(), element: page(ciRelForm) },

  { path: ROUTES.agentRepository, element: page(agentRepo) },
  { path: ROUTES.agentNew, element: page(agentForm) },
  { path: ROUTES.agentEdit(), element: page(agentForm) },

  { path: ROUTES.runbook, element: page(runbookBuilder) },
  { path: ROUTES.runbookEdit(), element: page(runbookBuilder) },
  {
    path: ROUTES.runbookList,
    element: page(() => import('@/features/workflows/pages/RunbookListPage')),
  },

  {
    path: ROUTES.executionReport,
    element: page(() => import('@/features/reports/pages/ExecutionReportPage')),
  },

  { path: ROUTES.aiModel, element: page(aiModelList) },
  { path: ROUTES.aiModelNew, element: page(aiModelForm) },
  { path: ROUTES.aiModelEdit(), element: page(aiModelForm) },
  { path: ROUTES.aiConfiguration, element: page(aiConfigList) },
  { path: ROUTES.aiConfigurationNew, element: page(aiConfigForm) },
  { path: ROUTES.aiConfigurationEdit(), element: page(aiConfigForm) },
  { path: ROUTES.aiAgents, element: page(() => import('@/features/aiAgents/pages/AiAgentsPage')) },
  {
    path: ROUTES.aiAgentRun(),
    element: page(() => import('@/features/aiAgents/pages/AiAgentRunPage')),
  },

  { path: ROUTES.certificateMonitoring, element: page(modulePending) },
  { path: ROUTES.indiaCloud, element: page(modulePending) },
  { path: ROUTES.configurations, element: page(modulePending) },
  { path: ROUTES.itAssistant, element: page(modulePending) },

  { path: '*', element: page(() => import('@/features/errors/pages/NotFoundPage')) },
];

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: ROUTES.login, element: page(() => import('@/features/auth/pages/LoginPage')) },
      {
        path: ROUTES.reference,
        element: page(() => import('@/features/reference/pages/ReferencePage')),
      },
      {
        path: ROUTES.referenceLite,
        element: page(() => import('@/features/reference/pages/LiteReferencePage')),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <AppLayout />,
            errorElement: <RouteErrorPage />,
            children: appRoutes,
          },
        ],
      },
    ],
  },
];

export const createAppRouter = () => createBrowserRouter(routes);
