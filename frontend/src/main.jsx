// Punto de entrada: monta la aplicación React dentro del <div id="root"> del index.html
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// BrowserRouter habilita la navegación por rutas (/generos, /directores, ...)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
