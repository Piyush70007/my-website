import React from 'react';
import { createRoot } from 'react-dom/client';
import { MotionProvider } from './MotionSystem.jsx';
import App from './App.jsx';
import './style.css';
import './motion.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><MotionProvider><App /></MotionProvider></React.StrictMode>,
);
