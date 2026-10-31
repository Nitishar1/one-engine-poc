import type { ComponentType } from 'react';
import { Drawer } from 'antd';
import { AppButton } from '@/components/common/AppButton';
import { getNodeDefinition } from '../config/nodeRegistry';
import { nodeAccentVar } from '../config/nodeAccents';
import { useWorkflowStore } from '../stores/workflowStore';
import type { WorkflowNode, WorkflowNodeType } from '../types/workflow.types';
import { PROPERTIES_FORM_ID, type NodePropertiesFormProps } from './properties/types';

/** Right-hand drawer (inside the canvas container) that edits the selected step. */
export function NodePropertiesPanel() {
  const editingNodeId = useWorkflowStore((s) => s.editingNodeId);
  const node = useWorkflowStore((s) => s.nodes.find((n) => n.id === s.editingNodeId));
  const setEditingNode = useWorkflowStore((s) => s.setEditingNode);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const close = () => setEditingNode(null);
  const def = node ? getNodeDefinition(node.type) : null;
  const Form = def?.propertiesForm as
    ComponentType<NodePropertiesFormProps<WorkflowNodeType>> | undefined;
  const Icon = def?.icon;

  return (
    <Drawer
      open={Boolean(editingNodeId && node)}
      onClose={close}
      getContainer={false}
      mask={false}
      size={380}
      title={
        def && node ? (
          <span className="flex items-center gap-2.5">
            {Icon && (
              <span
                className="oe-type-tile"
                style={{ ['--accent' as string]: nodeAccentVar(node.type) }}
                aria-hidden
              >
                <Icon size={14} />
              </span>
            )}
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate">{def.label} properties</span>
              <span className="truncate text-[12px] font-normal text-fg-muted">
                {def.description}
              </span>
            </span>
          </span>
        ) : (
          'Properties'
        )
      }
      rootClassName="oe-properties-drawer"
      destroyOnHidden
      footer={
        <div className="flex justify-end gap-2">
          <AppButton tone="secondary" onClick={close}>
            Cancel
          </AppButton>
          <AppButton htmlType="submit" form={PROPERTIES_FORM_ID}>
            Apply changes
          </AppButton>
        </div>
      }
    >
      {node && Form && (
        <Form
          key={node.id}
          node={node as WorkflowNode & { type: WorkflowNodeType }}
          onApply={(data) => {
            updateNodeData(node.id, data);
            close();
          }}
        />
      )}
    </Drawer>
  );
}
