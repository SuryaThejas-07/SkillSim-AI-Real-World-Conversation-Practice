import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { AppThemeProvider } from "@/components/ThemeProvider";
import APIErrorLogger from "@/components/APIErrorLogger";
import ConfigBanner from "@/components/ConfigBanner";
import Navbar from "@/components/Navbar";
import Home from "./pages/Home";
import { SkeletonChart } from "@/components/Skeleton";
import { logConfigStatus } from "@/lib/configVerification";

// Lazy load feature pages for better performance
const Categories = lazy(() => import("./pages/Categories"));
const Characters = lazy(() => import("./pages/Characters"));
const Simulation = lazy(() => import("./pages/Simulation"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const History = lazy(() => import("./pages/History"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <SkeletonChart />
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  // Health check on app startup
  useEffect(() => {
    logConfigStatus();
  }, []);

  return (
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <APIErrorLogger />
          <ConfigBanner />
          <BrowserRouter>
            <AuthProvider>
              <ProgressProvider>
                <Navbar />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/characters" element={<Characters />} />
                  <Route path="/simulation/:id" element={<Simulation />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ProgressProvider>
          </AuthProvider>
        </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AppThemeProvider>
  );
};

export default App;
