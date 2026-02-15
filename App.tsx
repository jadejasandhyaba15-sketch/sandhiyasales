import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CSL from './pages/CSL';
import Invoice from './pages/Invoice';
import Payments from './pages/Payments';
import Employees from './pages/Employees';
import Chats from './pages/Chats';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/csl" element={<CSL />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/chats" element={<Chats />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;