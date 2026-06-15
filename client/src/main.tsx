import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './ui/app-layout';
import { BirthdayPageView } from './ui/birthday-page-view';
import { DashboardView } from './ui/dashboard-view';
import { GroupView } from './ui/group-view';
import { LoginView } from './ui/login-view';
import { RegisterView } from './ui/register-view';
import { WriteWishView } from './ui/write-wish-view';
import './styles.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/groups/:groupId" element={<GroupView />} />
          <Route path="/write-wish/:groupId/:toUserId" element={<WriteWishView />} />
          <Route path="/b/:token" element={<BirthdayPageView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
