import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "../store";
import { useI18n } from "../contexts/I18nContext";

const typeBadgeColors: Record<string, string> = {
  file: "text-node-file border border-node-file/30 bg-node-file/10",
  function: "text-node-function border border-node-function/30 bg-node-function/10",
  class: "text-node-class border border-node-class/30 bg-node-class/10",
  module: "text-node-module border border-node-module/30 bg-node-module/10",
  concept: "text-node-concept border border-node-concept/30 bg-node-concept/10",
  config: "text-node-config border border-node-config/30 bg-node-config/10",
  document: "text-node-document border border-node-document/30 bg-node-document/10",
  service: "text-node-service border border-node-service/30 bg-node-service/10",
  table: "text-node-table border border-node-table/30 bg-node-table/10",
  endpoint: "text-node-endpoint border border-node-endpoint/30 bg-node-endpoint/10",
  pipeline: "text-node-pipeline border border-node-pipeline/30 bg-node-pipeline/10",
  schema: "text-node-schema border border-node-schema/30 bg-node-schema/10",
  resource: "text-node-resource border border-node-resource/30 bg-node-resource/10",
  domain: "text-node-concept border border-node-concept/30 bg-node-concept/10",
  flow: "text-node-pipeline border border-node-pipeline/30 bg-node-pipeline/10",
  step: "text-node-function border border-node-function/30 bg-node-function/10",
};

export default function SearchBar() {
  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const searchResults = useDashboardStore((s) => s.searchResults);
  const graph = useDashboardStore((s) => s.graph);
  const setSearchQuery = useDashboardStore((s) => s.setSearchQuery);
  const navigateToNodeInLayer = useDashboardStore((s) => s.navigateToNodeInLayer);
  const searchMode = useDashboardStore((s) => s.searchMode);
  const setSearchMode = useDashboardStore((s) => s.setSearchMode);
  const { t } = useI18n();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build a lookup map for node details
  const nodeMap = useMemo(
    () => new Map((graph?.nodes ?? []).map((n) => [n.id, n])),
    [graph],
  );

  const topResults = searchResults.slice(0, 5);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setDropdownOpen(true);
      setActiveIndex(-1);
    },
    [setSearchQuery],
  );

  const handleResultClick = useCallback(
    (nodeId: string) => {
      navigateToNodeInLayer(nodeId);
      setDropdownOpen(false);
      setActiveIndex(-1);
    },
    [navigateToNodeInLayer],
  );

  // Keyboard navigation: arrow keys, enter, escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if search dropdown is open
      if (!dropdownOpen || topResults.length === 0) {
        if (e.key === "Escape") {
          setDropdownOpen(false);
          inputRef.current?.blur();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < topResults.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : topResults.length - 1,
          );
          break;
        case "Enter":
          if (activeIndex >= 0 && activeIndex < topResults.length) {
            e.preventDefault();
            handleResultClick(topResults[activeIndex].nodeId);
          }
          break;
        case "Escape":
          setDropdownOpen(false);
          setActiveIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dropdownOpen, topResults, activeIndex, handleResultClick]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = dropdownOpen && searchQuery.trim() && topResults.length > 0;

  return (
    <div ref={containerRef} className="relative z-30">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-surface border-b border-border-subtle">
        <svg
          className="w-4 h-4 text-text-muted shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setDropdownOpen(true)}
          placeholder={t.search.placeholder}
          data-testid="search-input"
          className="flex-1 min-w-0 bg-elevated text-text-primary text-sm rounded-lg px-3 py-1.5 border border-border-subtle focus:outline-none focus:border-accent/50 placeholder-text-muted"
        />
        <div className="flex items-center gap-1 bg-elevated rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => setSearchMode("fuzzy")}
            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
              searchMode === "fuzzy"
                ? "bg-accent/20 text-accent"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {t.search.fuzzy}
          </button>
          <button
            onClick={() => setSearchMode("semantic")}
            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
              searchMode === "semantic"
                ? "bg-accent/20 text-accent"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {t.search.semantic}
          </button>
        </div>
        {searchQuery.trim() && (
          <span className="hidden sm:inline text-xs text-text-muted shrink-0">
            {searchResults.length} {t.search.result}{searchResults.length !== 1 ? "s" : ""}{" "}
            <span className="text-text-muted">({searchMode})</span>
          </span>
        )}
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div
          className="absolute left-4 right-4 top-full mt-0.5 glass rounded-lg shadow-xl overflow-hidden"
          role="listbox"
          aria-label="Search results"
        >
          {topResults.map((result, idx) => {
            const node = nodeMap.get(result.nodeId);
            if (!node) return null;

            const relevance = Math.round((1 - result.score) * 100);
            const badgeColor = typeBadgeColors[node.type] ?? typeBadgeColors.file;
            const isActive = idx === activeIndex;

            return (
              <button
                key={result.nodeId}
                type="button"
                onClick={() => handleResultClick(result.nodeId)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`w-full flex items-center gap-3 px-3 py-2 transition-colors text-left ${
                  isActive
                    ? "bg-accent/10 text-text-primary"
                    : "hover:bg-elevated text-text-secondary"
                }`}
                role="option"
                aria-selected={isActive}
              >
                {/* Type badge */}
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeColor} shrink-0`}
                >
                  {node.type}
                </span>

                {/* Node name */}
                <span className="text-sm text-text-primary truncate flex-1">
                  {node.name}
                </span>

                {/* Relevance bar */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-16 h-1.5 bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${relevance}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted w-7 text-right">
                    {relevance}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
