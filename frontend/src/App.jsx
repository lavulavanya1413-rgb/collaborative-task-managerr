import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tasks from './pages/Tasks.jsx';
import Records from './pages/Records.jsx';
import Team from './pages/Team.jsx';
import Activity from './pages/Activity.jsx';

function Protected({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading your workspace…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;

  return children;
}

function Resource({ type, roles }) {
  return (
    <Protected roles={roles}>
      <Records type={type} />
    </Protected>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? '/app' : '/login'} replace />} />
      <Route path="/login" element={user ? <Navigate to="/app" replace /> : <Auth mode="login" />} />
      <Route path="/signup" element={user ? <Navigate to="/app" replace /> : <Auth mode="signup" />} />
      <Route
        path="/app"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="projects" element={<Resource type="projects" roles={['Manager', 'Developer', 'QA Tester', 'User']} />} />
        <Route path="requirements" element={<Resource type="requirements" roles={['Manager', 'Developer', 'User']} />} />
        <Route path="sprints" element={<Resource type="sprints" roles={['Manager', 'Developer', 'User']} />} />
        <Route path="testcases" element={<Resource type="testcases" roles={['Manager', 'QA Tester', 'Developer', 'User']} />} />
        <Route path="testruns" element={<Resource type="testruns" roles={['Manager', 'QA Tester', 'Developer', 'User']} />} />
        <Route path="bugs" element={<Resource type="bugs" roles={['Manager', 'Developer', 'QA Tester', 'User']} />} />
        <Route path="releases" element={<Resource type="releases" roles={['Manager', 'QA Tester', 'Developer', 'User']} />} />
        <Route path="team" element={<Protected roles={['Manager', 'User', 'Developer', 'QA Tester']}><Team /></Protected>} />
        <Route path="activity" element={<Protected roles={['Manager', 'User', 'Developer', 'QA Tester']}><Activity /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}