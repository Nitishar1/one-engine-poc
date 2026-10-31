import { createContext, useContext } from 'react';

/** Ids of nodes that currently fail validation, provided by the canvas to node components. */
export const NodeIssuesContext = createContext<Set<string>>(new Set());

export const useNodeHasIssues = (id: string) => useContext(NodeIssuesContext).has(id);
