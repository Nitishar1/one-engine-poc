import { beforeEach, describe, expect, it } from 'vitest';
import { agentsSeed } from '@/mocks/data/agents.data';
import { runbooksSeed } from '@/mocks/data/runbooks.data';
import { NODE_REGISTRY } from '../config/nodeRegistry';
import { useWorkflowStore } from '../stores/workflowStore';
import { parseDefinition, toDefinition } from '../utils/serialization';
import { validateWorkflow } from '../utils/validateWorkflow';

const store = () => useWorkflowStore.getState();
const healthAgent = agentsSeed.find((a) => a.name === 'healthCheck')!;
const startAgent = agentsSeed.find((a) => a.name === 'StartServiceProcess')!;

describe('workflow store and rules', () => {
  beforeEach(() => store().reset());

  it('starts with a single Start node and a clean state', () => {
    expect(store().nodes).toHaveLength(1);
    expect(store().nodes[0].type).toBe('start');
    expect(store().dirty).toBe(false);
  });

  it('adds nodes from the registry and connects them', () => {
    const startId = store().nodes[0].id;
    const actionId = store().addNode(
      'action',
      { x: 300, y: 80 },
      NODE_REGISTRY.action.createData({ agent: healthAgent }),
    );

    expect(
      store().connect({
        source: startId,
        target: actionId,
        sourceHandle: null,
        targetHandle: null,
      }),
    ).toBeNull();
    expect(store().edges).toHaveLength(1);
    expect(store().dirty).toBe(true);
  });

  it('rejects invalid connections', () => {
    const startId = store().nodes[0].id;
    const a = store().addNode(
      'action',
      { x: 0, y: 0 },
      NODE_REGISTRY.action.createData({ agent: healthAgent }),
    );
    const b = store().addNode(
      'action',
      { x: 0, y: 0 },
      NODE_REGISTRY.action.createData({ agent: startAgent }),
    );
    const conn = (source: string, target: string) => ({
      source,
      target,
      sourceHandle: null,
      targetHandle: null,
    });

    expect(store().connect(conn(a, a))).toMatch(/itself/);
    expect(store().connect(conn(a, startId))).toMatch(/Start cannot have incoming/);
    expect(store().connect(conn(a, b))).toBeNull();
    expect(store().connect(conn(b, a))).toMatch(/loop/);
    expect(store().connect(conn(a, startId))).not.toBeNull();
  });

  it('removing a node removes its connections', () => {
    const startId = store().nodes[0].id;
    const a = store().addNode('end', { x: 0, y: 0 }, { label: 'End' });
    store().connect({ source: startId, target: a, sourceHandle: null, targetHandle: null });
    store().removeNodes([a]);
    expect(store().edges).toHaveLength(0);
  });

  it('validates required agent parameters and reachability', () => {
    const startId = store().nodes[0].id;
    const action = store().addNode(
      'action',
      { x: 0, y: 0 },
      NODE_REGISTRY.action.createData({ agent: startAgent }),
    );
    const orphan = store().addNode('delay', { x: 0, y: 0 }, { label: 'Wait', seconds: 5 });
    store().connect({ source: startId, target: action, sourceHandle: null, targetHandle: null });

    const issues = validateWorkflow(store().nodes, store().edges, agentsSeed);
    expect(issues.some((i) => i.nodeId === action && /missing Service Name/.test(i.message))).toBe(
      true,
    );
    expect(
      issues.some((i) => i.nodeId === orphan && /not connected to Start/.test(i.message)),
    ).toBe(true);

    store().updateNodeData<'action'>(action, { parameters: { ServiceName: 'W3SVC' } });
    const after = validateWorkflow(store().nodes, store().edges, agentsSeed);
    expect(after.some((i) => i.nodeId === action)).toBe(false);
  });

  it('round-trips a saved runbook through load, serialization and JSON import', () => {
    const seed = runbooksSeed[0].definition;
    store().load(seed);
    const exported = toDefinition(store().nodes, store().edges);
    expect(exported.nodes).toHaveLength(seed.nodes.length);
    expect(exported.edges.find((e) => e.sourceHandle === 'false')?.label).toBe('No');

    const reimported = parseDefinition(JSON.stringify({ definition: exported }));
    expect(reimported.nodes.map((n) => n.id)).toEqual(seed.nodes.map((n) => n.id));
    expect(
      validateWorkflow(store().nodes, store().edges, agentsSeed).filter(
        (i) => i.severity === 'error',
      ),
    ).toEqual([]);
    expect(() => parseDefinition('{"nodes": "nope"}')).toThrow();
  });
});
