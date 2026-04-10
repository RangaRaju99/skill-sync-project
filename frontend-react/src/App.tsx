import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout'; // Fixed Import
import HomePage from './features/public/pages/HomePage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import OtpVerifyPage from './features/auth/pages/OtpVerifyPage';
import RegisterDetailsPage from './features/auth/pages/RegisterDetailsPage';
import AuthSuccessPage from './features/auth/pages/AuthSuccessPage';
import ChatPage from './features/chat/pages/ChatPage';
import MentorsPage from './features/mentors/pages/MentorsPage';
import MentorDetailPage from './features/mentors/pages/MentorDetailPage';
import ApplyMentorPage from './features/mentors/pages/ApplyMentorPage';
import SessionsPage from './features/sessions/pages/SessionsPage';
import RequestSessionPage from './features/sessions/pages/RequestSessionPage';
import SessionDetailPage from './features/sessions/pages/SessionDetailPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import SettingsPage from './features/profile/pages/SettingsPage';
import ActivityHistoryPage from './features/activity/pages/ActivityHistoryPage';
import SkillsPage from './features/skills/pages/SkillsPage';
import GroupsPage from './features/groups/pages/GroupsPage';
import GroupDetailPage from './features/groups/pages/GroupDetailPage';
import MentorReviewsPage from './features/reviews/pages/MentorReviewsPage';
import CheckoutPage from './features/payment/pages/CheckoutPage';
import NotificationsPage from './features/notifications/pages/NotificationsPage';
import AdminAnalyticsPage from './features/admin/pages/AdminAnalyticsPage';
import AdminDashboardPage from './features/admin/pages/AdminDashboardPage';
import AdminUsersPage from './features/admin/pages/AdminUsersPage';
import AdminMentorsPage from './features/admin/pages/AdminMentorsPage';
import AdminGroupsPage from './features/admin/pages/AdminGroupsPage';
import AdminRolesPage from './features/admin/pages/AdminRolesPage';
import AdminAuditLogsPage from './features/admin/pages/AdminAuditLogsPage';
import AdminSettingsPage from './features/admin/pages/AdminSettingsPage';
import MentorDashboardPage from './features/mentor-dashboard/pages/MentorDashboardPage';
import GrowthDashboardPage from './features/growth-dashboard/pages/GrowthDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedPage from './components/UnauthorizedPage';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { userService } from './services/user.service';

function App() {
  const { setAuth, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        let roles: string[] = [];
        let jwtUserId: string | null = null;
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const claims = JSON.parse(window.atob(base64));
          roles = claims.roles || [];
          jwtUserId = claims.userId ? String(claims.userId) : null;

          // Check for expiration
          const now = Math.floor(Date.now() / 1000);
          if (claims.exp && claims.exp < now) {
            console.warn('Token expired, logging out locally...');
            logout();
            window.location.href = '/auth/login';
            return;
          }
        } catch (e) {
          console.warn('Failed to decode JWT on startup:', e);
        }

        try {
          const response = await userService.getCurrentUser();
          const userData = response.data || response;

          const user = {
            id: String(userData.userId || userData.id || jwtUserId || ''),
            name: userData.name || userData.username || userData.email || '',
            email: userData.email || '',
            username: userData.username,
            roles,
          };

          setAuth(user, token);
        } catch (e: any) {
          if (e.response?.status !== 401) {
            console.error('Initial auth check failed:', e);
          }
          if (jwtUserId && roles.length) {
            const fallbackUser = {
              id: jwtUserId,
              name: localStorage.getItem('ss_name') || '',
              email: localStorage.getItem('ss_email') || '',
              username: localStorage.getItem('ss_username') || undefined,
              roles,
            };
            setAuth(fallbackUser, token);
          } else {
            logout();
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [setAuth, logout]);


  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return (
    <Router>
      <Routes>
        {/* Base Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<HomePage />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="login" />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="verify-otp" element={<OtpVerifyPage />} />
          <Route path="register-details" element={<RegisterDetailsPage />} />
          <Route path="success" element={<AuthSuccessPage />} />
        </Route>

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="mentors" element={<MentorsPage />} />
            <Route path="mentors/:id" element={<MentorDetailPage />} />
            <Route path="mentors/apply" element={<ApplyMentorPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="sessions/request" element={<RequestSessionPage />} />
            <Route path="sessions/:id" element={<SessionDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="activity-history" element={<ActivityHistoryPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="groups/:id" element={<GroupDetailPage />} />
            <Route path="reviews/mentor/:mentorId" element={<MentorReviewsPage />} />
            <Route path="payment" element={<CheckoutPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="mentor-dashboard" element={<MentorDashboardPage />} />
            <Route path="growth" element={<GrowthDashboardPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>

          {/* Admin Dedicated Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="mentors" element={<AdminMentorsPage />} />
            <Route path="groups" element={<AdminGroupsPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* Global Redirects */}
        <Route path="*" element={<Navigate to="/mentors" />} />
      </Routes>
    </Router>
  );
}

export default App;
