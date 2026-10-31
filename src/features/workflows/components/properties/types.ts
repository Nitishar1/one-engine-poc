import type {
  WorkflowNodeDataMap,
  WorkflowNodeOf,
  WorkflowNodeType,
} from '../../types/workflow.types';

export interface NodePropertiesFormProps<K extends WorkflowNodeType> {
  node: WorkflowNodeOf<K>;
  onApply: (data: Partial<WorkflowNodeDataMap[K]>) => void;
}

export const PROPERTIES_FORM_ID = 'oe-node-properties-form';
