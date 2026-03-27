import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import SimpleAlertDashboard from "./pages/SimpleAlertDashboard_FIXED";
import ApiDetailPage from "./pages/ApiDetailPage";
import ChartDemo from "./pages/ChartDemo";
import IncidentTrackingDemo from "./pages/IncidentTrackingDemo";
import ApiTestPage from "./pages/ApiTestPage";
import ApiMonitorDashboard from "./pages/ApiMonitorDashboard";

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Default route - redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard route */}
            <Route path="/dashboard" element={<SimpleAlertDashboard />} />
            
            {/* API details route */}
            <Route path="/api/:id" element={<ApiDetailPage />} />
            
            {/* Chart demo route */}
            <Route path="/chart-demo" element={<ChartDemo />} />
            
            {/* Incident tracking demo route */}
            <Route path="/incidents" element={<IncidentTrackingDemo />} />
            
            {/* API monitor dashboard route */}
            <Route path="/monitor" element={<ApiMonitorDashboard />} />
            
            {/* API test route */}
            <Route path="/api-test" element={<ApiTestPage />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
