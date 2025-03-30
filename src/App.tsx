import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { PaymentPage } from './pages/PaymentPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
