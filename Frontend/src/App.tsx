import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RootRedirect from "./components/auth/RootRedirect";
import { ToastProvider } from "./context/ToastContext";
function App() {
  return (
    <BrowserRouter>
    <ToastProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<RootRedirect />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;