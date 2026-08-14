import { useEffect, useRef, useCallback } from "react";
import { useDashboardStore } from "../store";
import { useI18n } from "../contexts/I18nContext";

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  nodeLabel: string;
  onClose: () => void;
}

export default function NodeContextMenu({
  x,
  y,
  nodeId,
  nodeLabel,
  onClose,
}: ContextMenuProps) {
  const selectNode = useDashboardStore((s) => s.selectNode);
  const togglePathFinder = useDashboardStore((s) => s.togglePathFinder);
  const setFocusNode = useDashboardStore((s) => s.setFocusNode);
  const { t } = useI18n();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSelect = useCallback(() => {
    selectNode(nodeId);
    onClose();
  }, [selectNode, nodeId, onClose]);

  const handleFocus = useCallback(() => {
    setFocusNode(nodeId);
    onClose();
  }, [setFocusNode, nodeId, onClose]);

  const handlePathFind = useCallback(() => {
    selectNode(nodeId);
    togglePathFinder();
    onClose();
  }, [selectNode, togglePathFinder, nodeId, onClose]);

  const handleCopyName = useCallback(() => {
    navigator.clipboard.writeText(nodeLabel).catch(() => {});
    onClose();
  }, [nodeLabel, onClose]);

  // Adjust position to stay within viewport
  const style: React.CSSProperties = {
    position: "fixed",
    left: x,
    top: y,
    zIndex: 9998,
  };

  return (
    <div
      ref={menuRef}
      style={style}
      className="glass rounded-lg shadow-2xl overflow-hidden scale-in min-w-[180px]"
      role="menu"
      aria-label={`Actions for ${nodeLabel}`}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-border-subtle">
        <p className="text-xs text-text-muted truncate" title={nodeLabel}>
          {nodeLabel}
        </p>
      </div>

      {/* Actions */}
      <div className="p-1">
        <MenuItem
          icon="◎"
          label={t.contextMenu?.select ?? "Select node"}
          onClick={handleSelect}
        />
        <MenuItem
          icon="◉"
          label={t.contextMenu?.focus ?? "Show neighborhood"}
          onClick={handleFocus}
        />
        <MenuItem
          icon="⇄"
          label={t.contextMenu?.pathFind ?? "Find paths from here"}
          onClick={handlePathFind}
        />
        <div className="my-1 border-t border-border-subtle" />
        <MenuItem
          icon="⧉"
          label={t.contextMenu?.copyName ?? "Copy name"}
          onClick={handleCopyName}
        />
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors rounded-md text-left"
      role="menuitem"
    >
      <span className="text-xs w-4 text-center text-text-muted">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
