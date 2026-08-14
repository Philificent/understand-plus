import { useEffect } from "react";
import { useDashboardStore } from "../store";

/**
 * Syncs selectedNodeId with the URL hash for deep-linking.
 * - When a node is selected, updates the URL hash (#node=xxx)
 * - On mount, reads the hash and selects the referenced node
 */
export function useDeepLink() {
  const selectedNodeId = useDashboardStore((s) => s.selectedNodeId);
  const selectNode = useDashboardStore((s) => s.selectNode);
  const graph = useDashboardStore((s) => s.graph);

  // On mount: read hash and select node if present
  useEffect(() => {
    if (!graph) return;

    const hash = window.location.hash;
    const match = hash.match(/^#node=(.+)$/);
    if (match) {
      const nodeId = decodeURIComponent(match[1]);
      // Verify node exists in graph
      const nodeExists = graph.nodes.some((n) => n.id === nodeId);
      if (nodeExists) {
        // Delay slightly to ensure graph is rendered
        setTimeout(() => selectNode(nodeId), 100);
      }
    }
  }, [graph, selectNode]);

  // On selection change: update URL hash
  useEffect(() => {
    if (selectedNodeId) {
      const newHash = `#node=${encodeURIComponent(selectedNodeId)}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, "", newHash);
      }
    } else if (window.location.hash.startsWith("#node=")) {
      // Clear hash when selection is cleared
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [selectedNodeId]);
}
