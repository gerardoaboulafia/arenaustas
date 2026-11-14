// AI-assisted: written with Claude Code, reviewed by the team.
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './app/AppLayout';
import { LogPage } from './app/LogPage';
import { ProjectionPage } from './app/ProjectionPage';
import { TwinPage } from './app/TwinPage';
import { MissionProvider } from './app/state';
import { LandingPage } from './landing/LandingPage';

// HashRouter: the site is static and works from any subpath (GitHub Pages) with no server rules.
export function AppRouter() {
  return (
    <MissionProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<TwinPage />} />
            <Route path="projection" element={<ProjectionPage />} />
            <Route path="log" element={<LogPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </MissionProvider>
  );
}
