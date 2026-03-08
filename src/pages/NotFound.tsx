import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, AlertCircle, ArrowLeft } from "lucide-react";
import { logger } from "@/lib/logger";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    logger.warn("404 Error: User attempted to access non-existent route", {
      pathname: location.pathname,
      referrer: document.referrer,
    });
  }, [location.pathname]);

  const recentPages = [
    { label: "Home", path: "/" },
    { label: "Skills", path: "/categories" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Characters", path: "/characters" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          {/* Error Icon */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </motion.div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-foreground">404</h1>
            <p className="text-xl font-semibold text-muted-foreground">
              Page Not Found
            </p>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sorry, we couldn't find the page you're looking for. It might have
              been moved or deleted.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => navigate("/")} size="lg">
              <Home className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </div>

          {/* Recent Pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border-t border-border pt-8"
          >
            <p className="text-sm font-medium text-foreground mb-4">
              Quick Navigation
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {recentPages.map((page) => (
                <Button
                  key={page.path}
                  onClick={() => navigate(page.path)}
                  variant="ghost"
                  className="text-sm"
                >
                  {page.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Debug Info (dev only) */}
          {import.meta.env.DEV && (
            <div className="mt-8 p-3 rounded-lg bg-secondary/30 text-xs text-muted-foreground text-left font-mono">
              <p className="font-semibold mb-1">Debug Info:</p>
              <p>Requested URL: {location.pathname}</p>
              <p>Referrer: {document.referrer || "direct"}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
