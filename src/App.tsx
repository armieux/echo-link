
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { AIProvider } from "@/contexts/AIContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/auth/Auth";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/auth/ResetPassword";
import EmergencyResources from "./pages/resources/EmergencyResources";
import RecoveryPosition from "./pages/resources/first-aid/RecoveryPosition";
import CPR from "./pages/resources/first-aid/CPR";
import BleedingControl from "./pages/resources/first-aid/BleedingControl";
import Profile from "./pages/Profile";
import VolunteerDashboard from "./pages/VolunteerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <AIProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/volunteer-dashboard"
                    element={
                      <ProtectedRoute>
                        <VolunteerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resources"
                    element={
                      <ProtectedRoute>
                        <EmergencyResources />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resources/first-aid/recovery-position"
                    element={
                      <ProtectedRoute>
                        <RecoveryPosition />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resources/first-aid/cpr"
                    element={
                      <ProtectedRoute>
                        <CPR />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resources/first-aid/bleeding-control"
                    element={
                      <ProtectedRoute>
                        <BleedingControl />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AIProvider>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
