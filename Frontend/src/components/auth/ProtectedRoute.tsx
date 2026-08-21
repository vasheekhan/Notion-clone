import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../../services/auth.service";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(() => {
        setAuthenticated(true);
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return null;
  }

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;