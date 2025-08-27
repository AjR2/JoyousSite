import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AgentManagement from './components/AgentManagement';
import Documentation from './components/Documentation';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<AgentManagement />} />
            <Route path="/help" element={<Documentation />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
