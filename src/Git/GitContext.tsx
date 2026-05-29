import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { GitClient, GitFileStatus, GitLogEntry } from './types';

interface GitContextType {
  status: GitFileStatus[];
  history: GitLogEntry[];
  remotes: string[];
  currentBranch: string;
  currentDir: string | null;
  refreshStatus: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  initRepo: () => Promise<void>;
  stageFiles: (paths: string[]) => Promise<void>;
  unstageFiles: (paths: string[]) => Promise<void>;
  commitChanges: (message: string) => Promise<void>;
  discardFile: (path: string) => Promise<void>;
  pushChanges: (remote: string) => Promise<void>;
}

const GitContext = createContext<GitContextType | undefined>(undefined);

export const useGit = () => {
  const context = useContext(GitContext);
  if (!context) {
    throw new Error('useGit must be used within a GitProvider');
  }
  return context;
};

interface GitProviderProps {
  children: React.ReactNode;
  client: GitClient;
  currentDir: string | null;
  subscribeFileChange?: (onChanged: () => void) => () => void;
}

export const GitProvider: React.FC<GitProviderProps> = ({
  children,
  client,
  currentDir,
  subscribeFileChange,
}) => {
  const [status, setStatus] = useState<GitFileStatus[]>([]);
  const [history, setHistory] = useState<GitLogEntry[]>([]);
  const [remotes, setRemotes] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('');

  const refreshStatus = useCallback(async () => {
    if (!currentDir) {
      setStatus([]);
      return;
    }
    try {
      const s = await client.status(currentDir);
      setStatus(s || []);
      const branch = await client.currentBranch(currentDir);
      setCurrentBranch(branch || '');
      const rem = await client.getRemotes(currentDir);
      setRemotes(rem || []);
    } catch (error) {
      console.error('Failed to refresh git status:', error);
      setStatus([]);
    }
  }, [client, currentDir]);

  const refreshHistory = useCallback(async () => {
    if (!currentDir) {
      setHistory([]);
      return;
    }
    try {
      const h = await client.log(currentDir);
      setHistory(h || []);
    } catch (error) {
      console.error('Failed to refresh git history:', error);
      setHistory([]);
    }
  }, [client, currentDir]);

  const initRepo = useCallback(async () => {
    if (!currentDir) return;
    await client.init(currentDir);
    await refreshStatus();
    await refreshHistory();
  }, [client, currentDir, refreshStatus, refreshHistory]);

  const stageFiles = useCallback(async (paths: string[]) => {
    if (!currentDir || paths.length === 0) return;
    await client.add(currentDir, paths);
    await refreshStatus();
  }, [client, currentDir, refreshStatus]);

  const unstageFiles = useCallback(async (paths: string[]) => {
    if (!currentDir || paths.length === 0) return;
    await client.reset(currentDir, paths);
    await refreshStatus();
  }, [client, currentDir, refreshStatus]);

  const commitChanges = useCallback(async (message: string) => {
    if (!currentDir || !message) return;
    await client.commit(currentDir, message);
    await refreshStatus();
    await refreshHistory();
  }, [client, currentDir, refreshStatus, refreshHistory]);

  const discardFile = useCallback(async (path: string) => {
    if (!currentDir || !path) return;
    await client.discard(currentDir, path);
    await refreshStatus();
  }, [client, currentDir, refreshStatus]);

  const pushChanges = useCallback(async (remote: string) => {
    if (!currentDir || !currentBranch) return;
    await client.push(currentDir, remote, currentBranch);
    await refreshStatus();
  }, [client, currentDir, currentBranch, refreshStatus]);

  // Handle file changes subscription
  useEffect(() => {
    if (!currentDir || !subscribeFileChange) return;

    const unsubscribe = subscribeFileChange(() => {
      refreshStatus();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentDir, subscribeFileChange, refreshStatus]);

  // Initial load
  useEffect(() => {
    if (currentDir) {
      refreshStatus();
      refreshHistory();
    } else {
      setStatus([]);
      setHistory([]);
      setCurrentBranch('');
      setRemotes([]);
    }
  }, [currentDir, refreshStatus, refreshHistory]);

  return (
    <GitContext.Provider
      value={{
        status,
        history,
        remotes,
        currentBranch,
        currentDir,
        refreshStatus,
        refreshHistory,
        initRepo,
        stageFiles,
        unstageFiles,
        commitChanges,
        discardFile,
        pushChanges,
      }}
    >
      {children}
    </GitContext.Provider>
  );
};
