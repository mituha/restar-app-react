import React, { useState } from 'react';
import { ProjectLauncher, type ProjectItem } from 'restar-app';

import { Star } from 'lucide-react';

const ProjectLauncherDemo: React.FC = () => {
  // デモ用の設定状態
  const [gitEnabled, setGitEnabled] = useState(true);
  const [customLabels, setCustomLabels] = useState(false);
  const [hasRecent, setHasRecent] = useState(true);
  const [backEnabled, setBackEnabled] = useState(true);

  // デモ用のデータ
  const [recentProjects, setRecentProjects] = useState<ProjectItem[]>(
    hasRecent ? [
      { name: 'My Great Novel', path: '/users/mituha/documents/novels/my-great-novel' },
      { name: 'Sci-Fi Adventure', path: '/users/mituha/documents/novels/scifi-adventure' },
    ] : []
  );

  // 最近のプロジェクト削除
  const handleRemoveRecent = (path: string) => {
    setRecentProjects(prev => prev.filter(p => p.path !== path));
    console.log('Removed project:', path);
  };

  // プロジェクトを開く
  const handleOpenProject = (path: string) => {
    alert(`プロジェクトを開きます: ${path}`);
  };

  // ディレクトリ選択のシミュレーション
  const handlePickDirectory = async () => {
    const mockPath = '/mock/path/selected/by/user';
    console.log('Picking directory...');
    return new Promise<string>((resolve) => {
      setTimeout(() => resolve(mockPath), 500);
    });
  };

  // プロジェクト作成のシミュレーション
  const handleCreateProject = async (params: { parentDir: string; name: string; cloneUrl?: string }) => {
    console.log('Creating project with params:', params);
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(`${params.parentDir}/${params.name}`);
      }, 1500);
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#121212' }}>
      {/* 設定パネル */}
      <div style={{
        width: '300px',
        padding: '20px',
        borderRight: '1px solid #333',
        color: '#fff',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h3>Demo Settings</h3>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input type="checkbox" checked={gitEnabled} onChange={e => setGitEnabled(e.target.checked)} />
          Enable Project Creation (Git)
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input type="checkbox" checked={customLabels} onChange={e => setCustomLabels(e.target.checked)} />
          Custom Labels & Icon
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input type="checkbox" checked={hasRecent} onChange={e => {
            setHasRecent(e.target.checked);
            if (e.target.checked) {
              setRecentProjects([
                { name: 'My Great Novel', path: '/users/mituha/documents/novels/my-great-novel' },
                { name: 'Sci-Fi Adventure', path: '/users/mituha/documents/novels/scifi-adventure' },
              ]);
            } else {
              setRecentProjects([]);
            }
          }} />
          Has Recent Projects
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input type="checkbox" checked={backEnabled} onChange={e => setBackEnabled(e.target.checked)} />
          Enable Back Button
        </label>

        <div style={{ marginTop: 'auto', fontSize: '12px', color: '#888' }}>
          <p>This panel simulates how the component adapts to different props.</p>
        </div>
      </div>

      {/* コンポーネント表示エリア */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ProjectLauncher
          title={customLabels ? "ReSTAR Editor" : "Project Launcher"}
          subtitle={customLabels ? "宇宙一の編集体験を、ここから。" : "プロジェクトを選択してください"}
          version="1.0.0-demo"
          logoIcon={customLabels ? <Star size={48} color="#ffd700" /> : undefined}
          recentProjects={recentProjects}
          onRemoveRecent={handleRemoveRecent}
          onOpenProject={handleOpenProject}
          onPickDirectory={handlePickDirectory}
          onCreateProject={gitEnabled ? handleCreateProject : undefined}
          isBackEnabled={backEnabled}
          onBack={() => alert('Back to Dashboard')}
          labels={customLabels ? {
            openFolder: "既存プロジェクトを開く",
            createProject: "新星のごとく作成",
            createProjectDesc: "銀河一の速さでセットアップします",
            browseButton: "探検する",
          } : undefined}
        />
      </div>
    </div>
  );
};

export default ProjectLauncherDemo;
