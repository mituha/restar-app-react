import React, { useEffect, useRef } from 'react';
import { createGitgraph, templateExtend, TemplateName } from '@gitgraph/js';
import type { GitLogEntry } from './types';

interface GitGraphProps {
  history: GitLogEntry[];
}

export const GitGraph: React.FC<GitGraphProps> = ({ history }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowHeight = 34; // Compact row height that balances spacing and content

  useEffect(() => {
    if (!containerRef.current || !history || history.length === 0) {
      return;
    }

    containerRef.current.innerHTML = '';

    const customTemplate = templateExtend(TemplateName.Metro, {
      colors: ['#00bcd4', '#ff9800', '#2196f3', '#9c27b0', '#4caf50', '#f44336', '#e91e63'],
      commit: {
        spacing: rowHeight, // Compact vertical spacing
        dot: {
          size: 7, // Smaller dots
        },
        message: {
          display: false,
        },
      },
      branch: {
        lineWidth: 2, // Thinner lines
        spacing: 12,
        label: {
          display: false, // Hide branch names (e.g. "main") from graph svg
        },
      },
    });

    try {
      const commits = [...history].reverse();
      // Add extra margin height to prevent first commit from being cut off at the bottom
      const computedHeight = commits.length * rowHeight + 20;

      containerRef.current.style.height = `${computedHeight}px`;

      const gitgraph = createGitgraph(containerRef.current, {
        template: customTemplate,
        orientation: 'vertical-reverse' as any,
      });

      const branchMap = new Map<string, any>();
      const activeBranches = new Map<string, any>();

      const parseRefs = (refsStr: string) => {
        if (!refsStr) return [];
        return refsStr.split(',').map(r => r.replace('HEAD ->', '').replace('tag:', '').trim());
      };

      let mainBranch = gitgraph.branch('main');
      activeBranches.set('main', mainBranch);

      commits.forEach((commit, index) => {
        const { hash, message, author_name, parents, refs } = commit;
        const refNames = parseRefs(refs);

        let currentBranch = mainBranch;

        if (index === 0) {
          currentBranch.commit({
            hash,
            subject: message,
            author: author_name,
          });
          branchMap.set(hash, currentBranch);
        } else {
          const primaryParentHash = parents[0];

          if (primaryParentHash && branchMap.has(primaryParentHash)) {
            currentBranch = branchMap.get(primaryParentHash);
          }

          const newBranchName = refNames.find(ref => ref && ref !== 'main' && !ref.includes('/') && !activeBranches.has(ref));
          if (newBranchName) {
            currentBranch = currentBranch.branch(newBranchName);
            activeBranches.set(newBranchName, currentBranch);
          }

          if (parents.length > 1) {
            const mergeParentHash = parents[1];
            const mergeParentBranch = branchMap.get(mergeParentHash);

            if (mergeParentBranch && mergeParentBranch !== currentBranch) {
              currentBranch.merge({
                branch: mergeParentBranch,
                commitOptions: {
                  hash,
                  subject: message,
                  author: author_name,
                },
              });
            } else {
              currentBranch.commit({
                hash,
                subject: message,
                author: author_name,
              });
            }
          } else {
            currentBranch.commit({
              hash,
              subject: message,
              author: author_name,
            });
          }

          branchMap.set(hash, currentBranch);
        }
      });
    } catch (e) {
      console.error('Failed to draw gitgraph:', e);
    }
  }, [history]);

  return (
    <div
      ref={containerRef}
      className="git-ui-graph-wrapper"
      style={{ overflow: 'hidden', minHeight: '40px', width: '100%' }}
    />
  );
};
