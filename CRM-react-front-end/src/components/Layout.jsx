import { Outlet } from 'react-router-dom';
import NavBar from './NavBar.jsx';

const Layout = () => {
  return (
    <div>
      <NavBar />
      <main className="container">
        {/* Child routes will render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;