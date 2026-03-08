import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface APIError {
  type: "openai" | "firebase";
  message: string;
  timestamp: Date;
}

const APIErrorLogger = () => {
  const [errors, setErrors] = useState<APIError[]>([]);

  useEffect(() => {
    // Listen for API errors
    const handleAPIError = (event: CustomEvent<APIError>) => {
      setErrors((prev) => [event.detail, ...prev.slice(0, 4)]); // Keep last 5 errors
    };

    window.addEventListener("apiError", handleAPIError as EventListener);
    return () => {
      window.removeEventListener("apiError", handleAPIError as EventListener);
    };
  }, []);

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-2">
      {errors.map((error, i) => (
        <Alert key={i} variant="destructive" className="animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{error.type.toUpperCase()} Error:</strong> {error.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

// Utility to emit API errors
export const reportAPIError = (type: "openai" | "firebase", message: string) => {
  const event = new CustomEvent("apiError", {
    detail: { type, message, timestamp: new Date() },
  });
  window.dispatchEvent(event);
  console.error(`${type.toUpperCase()} Error:`, message);
};

export default APIErrorLogger;
