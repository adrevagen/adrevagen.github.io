import React, { useState } from "react";

export function TreeViewNode({
  name,
  value,
  depth = 0,
  maxAutoExpandDepth = 2,
  searchQuery = "",
  path = "",
  onCopyPath
}) {
  const [isCollapsed, setIsCollapsed] = useState(depth >= maxAutoExpandDepth);

  const currentPath = path ? (name !== undefined ? `${path}.${name}` : path) : `${name ?? "root"}`;

  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const getValueType = (val) => {
    if (val === null) return "null";
    if (Array.isArray(val)) return "array";
    return typeof val;
  };

  const type = getValueType(value);

  const matchesSearch = (text) => {
    if (!searchQuery) return false;
    return String(text).toLowerCase().includes(searchQuery.toLowerCase());
  };

  const nameMatches = name !== undefined && matchesSearch(name);
  const valueMatches = !isExpandable && matchesSearch(value);
  const pathMatches = matchesSearch(currentPath);
  const isHighlighted = nameMatches || valueMatches || pathMatches;

  const renderValue = () => {
    if (value === null) {
      return <span className="tree-val-null">null</span>;
    }
    if (typeof value === "boolean") {
      return <span className="tree-val-boolean">{value ? "true" : "false"}</span>;
    }
    if (typeof value === "number") {
      return <span className="tree-val-number">{value}</span>;
    }
    if (typeof value === "string") {
      return <span className="tree-val-string">"{value}"</span>;
    }
    return null;
  };

  const getBadge = () => {
    if (isArray) {
      return <span className="tree-badge tree-badge-array">[{value.length} items]</span>;
    }
    if (isObject) {
      const keysCount = Object.keys(value).length;
      return <span className="tree-badge tree-badge-object">{`{${keysCount} keys}`}</span>;
    }
    return <span className={`tree-type-badge tree-type-${type}`}>{type}</span>;
  };

  return (
    <div className={`tree-node ${isHighlighted ? "tree-node-highlight" : ""}`} style={{ paddingLeft: depth > 0 ? "18px" : "0" }}>
      <div className="tree-node-header flex items-center gap-2 py-1 group rounded px-2 hover:bg-white/5 transition-colors">
        {isExpandable ? (
          <button
            type="button"
            className="tree-toggle-btn w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-green-400 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand node" : "Collapse node"}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : (
          <span className="w-5" />
        )}

        {name !== undefined && (
          <span className={`tree-key font-mono text-sm ${nameMatches ? "bg-amber-500/30 text-amber-200 px-1 rounded" : "text-purple-300"}`}>
            {name}:
          </span>
        )}

        {isExpandable ? (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
            {getBadge()}
          </div>
        ) : (
          <div className={`font-mono text-sm ${valueMatches ? "bg-amber-500/30 text-amber-200 px-1 rounded" : ""}`}>
            {renderValue()}
          </div>
        )}

        <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          {onCopyPath && (
            <button
              type="button"
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 hover:text-green-400 hover:bg-gray-700 transition-colors"
              onClick={() => onCopyPath(currentPath)}
              title={`Copy path: ${currentPath}`}
            >
              Copy Path
            </button>
          )}
        </div>
      </div>

      {isExpandable && !isCollapsed && (
        <div className="tree-node-children border-l border-gray-800/80 ml-2.5 my-0.5">
          {isArray
            ? value.map((item, idx) => (
                <TreeViewNode
                  key={idx}
                  name={idx}
                  value={item}
                  depth={depth + 1}
                  maxAutoExpandDepth={maxAutoExpandDepth}
                  searchQuery={searchQuery}
                  path={currentPath}
                  onCopyPath={onCopyPath}
                />
              ))
            : Object.entries(value).map(([key, val]) => (
                <TreeViewNode
                  key={key}
                  name={key}
                  value={val}
                  depth={depth + 1}
                  maxAutoExpandDepth={maxAutoExpandDepth}
                  searchQuery={searchQuery}
                  path={currentPath}
                  onCopyPath={onCopyPath}
                />
              ))}
        </div>
      )}
    </div>
  );
}
