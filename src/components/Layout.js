
import React from 'react';
import TabBar from './TabBar';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <div className="content-area">
        {children}
      </div>
      <TabBar />
    </div>
  );
};

export default Layout;
