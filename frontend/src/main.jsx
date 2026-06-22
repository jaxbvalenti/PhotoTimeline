import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import './styles/app.css';
import App from './App.jsx';

const googleClientId = "779207736952-ve0eoatagq3h9l4c3b8kbsin4eqr8kso.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
