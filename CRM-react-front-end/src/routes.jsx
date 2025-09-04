import { createBrowserRouter } from 'react-router-dom';

// Layout and wrappers
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public pages
import Home from './pages/Home.jsx';
import SignUp from './pages/auth/SignUp.jsx';
import SignIn from './pages/auth/SignIn.jsx';

// Protected pages
import Dashboard from './pages/dashboard/Dashboard.jsx';
import GroupProfile from './pages/groups/GroupProfile.jsx';
import NewGroup from './pages/groups/NewGroup.jsx';
import ContactProfile from './pages/contacts/ContactProfile.jsx';
import NewContact from './pages/contacts/NewContact.jsx';
import InvitePage from './pages/invites/InvitePage.jsx';

// --- DEBUG: this will print once at startup; every value should be "function" ---
console.log('route component types:', {
  Layout: typeof Layout,
  ProtectedRoute: typeof ProtectedRoute,
  Home: typeof Home,
  SignUp: typeof SignUp,
  SignIn: typeof SignIn,
  Dashboard: typeof Dashboard,
  GroupProfile: typeof GroupProfile,
  NewGroup: typeof NewGroup,
  ContactProfile: typeof ContactProfile,
  NewContact: typeof NewContact,
  InvitePage: typeof InvitePage,
});

export const router = createBrowserRouter([
  {
    element: <Layout />, // shared layout (e.g. nav + <Outlet />)
    children: [
      // Public routes
      { path: '/', element: <Home /> },
      { path: '/sign-up', element: <SignUp /> },
      { path: '/sign-in', element: <SignIn /> },

      // Protected area
      {
        element: <ProtectedRoute />, // wraps children with auth check
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/groups/new', element: <NewGroup /> },
          { path: '/groups/:id', element: <GroupProfile /> },
          { path: '/contacts/new', element: <NewContact /> },
          { path: '/contacts/:id', element: <ContactProfile /> },
          { path: '/invite', element: <InvitePage /> },
        ],
      },

      // Catch-all route
      { path: '*', element: <Home /> },
    ],
  },
]);