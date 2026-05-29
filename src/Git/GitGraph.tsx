import React from 'react';
import { Gitgraph, templateExtend, TemplateName } from '@gitgraph/react';
import type { GitLogEntry } from './types';

interface GitGraphProps {
  history: GitLogEntry[];
}

export const GitGraph: React.FC<GitGraphProps> = ({ history }) => {
  // Use a custom dark template matching novelaid theme
  const customTemplate = templateExtend(TemplateName.Metro, {
    colors: ['#00bcd4', '#ff9800', '#2196f3', '#9c27b0', '#4caf50', '#f44336', '#e91e63'],
    commit: {
      dot: {
        size: 10,
      },
      message: {
        display: false, // We display text list adjacent to it, so hide message inside graph svg
      },
    },
    branch: {
      lineWidth: 3,
      spacing: 16,
    },
  });

  if (!history || history.length === 0) {
    return null;
  }

  // To build the graph from past to present, we reverse the history
  const commits = [...history].reverse();
  const computedHeight = commits.length * 40;

  return (
    <div className="git-ui-graph-wrapper" style={{ overflowX: 'auto', overflowY: 'hidden', height: `${computedHeight}px`, minHeight: '80px' }}>
      <Gitgraph options={{ template: customTemplate, orientation: 'vertical-reverse' as any }}>
        {(gitgraph) => {
          // Maps commit hash to the branch object it belongs to
          const branchMap = new Map<string, any>();
          // Track active branches
          const activeBranches = new Map<string, any>();

          // Helper to get ref names from refs string (e.g. "HEAD -> main, origin/main")
          const parseRefs = (refsStr: string) => {
            if (!refsStr) return [];
            return refsStr.split(',').map(r => r.replace('HEAD ->', '').replace('tag:', '').trim());
          };

          // 1. Setup initial branch
          let mainBranch = gitgraph.branch('main');
          activeBranches.set('main', mainBranch);

          commits.forEach((commit, index) => {
            const { hash, message, author_name, parents, refs } = commit;
            const refNames = parseRefs(refs);

            // Determine branch for current commit
            let currentBranch = mainBranch;

            if (index === 0) {
              // First commit
              currentBranch.commit({
                hash,
                subject: message,
                author: author_name,
              });
              branchMap.set(hash, currentBranch);
            } else {
              // We check the parent(s)
              const primaryParentHash = parents[0];

              if (primaryParentHash && branchMap.has(primaryParentHash)) {
                currentBranch = branchMap.get(primaryParentHash);
              }

              // Check if we are creating a new branch based on refs (e.g., if there's a new branch ref on this commit)
              const newBranchName = refNames.find(ref => ref && ref !== 'main' && !ref.includes('/') && !activeBranches.has(ref));
              if (newBranchName) {
                currentBranch = currentBranch.branch(newBranchName);
                activeBranches.set(newBranchName, currentBranch);
              }

              // Handle Merge or Commit
              if (parents.length > 1) {
                // Merge commit
                const mergeParentHash = parents[1];
                const mergeParentBranch = branchMap.get(mergeParentHash);

                if (mergeParentBranch && mergeParentBranch !== currentBranch) {
                  // Merge secondary branch into current branch
                  currentBranch.merge({
                    branch: mergeParentBranch,
                    commitOptions: {
                      hash,
                      subject: message,
                      author: author_name,
                    },
                  });
                } else {
                  // Regular commit if we can't find parent branch
                  currentBranch.commit({
                    hash,
                    subject: message,
                    author: author_name,
                  });
                }
              } else {
                // Regular commit
                currentBranch.commit({
                  hash,
                  subject: message,
                  author: author_name,
                });
              }

              branchMap.set(hash, currentBranch);
            }
          });
        }}
      </Gitgraph>
    </div>
  );
};
