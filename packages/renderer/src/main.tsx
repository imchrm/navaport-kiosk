import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const container = document.getElementById('root');
if (container === null) throw new Error('[renderer] #root element not found in DOM');
createRoot(container).render(<App />);
