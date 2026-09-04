import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:slug" element={<ProductPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        <footer className="bg-white border-t border-gray-200 py-8 text-center text-xs text-gray-500">
          <p>© 2026 1Fi SDE1 Assignment — Mutual Fund Backed Product EMIs.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}