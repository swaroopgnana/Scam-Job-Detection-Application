import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
