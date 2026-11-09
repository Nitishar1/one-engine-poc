import { Tooltip } from 'antd';
import { Eye, SquarePen, Trash2 } from 'lucide-react';

interface RowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  entityName?: string;
}

/** Inline view / edit / delete icon buttons used in the Actions column of every grid. */
export function RowActions({ onView, onEdit, onDelete, entityName = 'item' }: RowActionsProps) {
  return (
    <div className="oe-row-actions flex items-center justify-end gap-0.5">
      {onView && (
        <Tooltip title="View">
          <button
            type="button"
            className="oe-icon-btn !h-7 !w-7"
            onClick={onView}
            aria-label={`View ${entityName}`}
          >
            <Eye size={15} />
          </button>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title="Edit">
          <button
            type="button"
            className="oe-icon-btn !h-7 !w-7"
            onClick={onEdit}
            aria-label={`Edit ${entityName}`}
          >
            <SquarePen size={15} />
          </button>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Delete">
          <button
            type="button"
            className="oe-icon-btn is-danger !h-7 !w-7"
            onClick={onDelete}
            aria-label={`Delete ${entityName}`}
          >
            <Trash2 size={15} />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
