import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../../services/auth.service";
import AuthPage from "../../pages/AuthPage";

const RootRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return authenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />;
};

export default RootRedirect;