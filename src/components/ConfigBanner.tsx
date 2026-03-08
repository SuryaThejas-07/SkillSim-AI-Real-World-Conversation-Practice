/**
 * Configuration Warning Banner
 * Shows warnings/errors if API keys are not properly configured
 */

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { verifyConfiguration } from "@/lib/configVerification";

interface ConfigStatus {
  openaiApiKey: boolean;
  firebase: boolean;
  allOk: boolean;
  warnings: string[];
  errors: string[];
}

export const ConfigBanner = () => {
  const [status, setStatus] = useState<ConfigStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const config = verifyConfiguration();
    setStatus(config);
  }, []);

  if (!status || dismissed || status.allOk) {
    return null;
  }

  const hasErrors = status.errors.length > 0;
  const bgColor = hasErrors ? "bg-red-50 dark:bg-red-900/20" : "bg-yellow-50 dark:bg-yellow-900/20";
  const borderColor = hasErrors ? "border-red-200 dark:border-red-700" : "border-yellow-200 dark:border-yellow-700";
  const textColor = hasErrors ? "text-red-800 dark:text-red-200" : "text-yellow-800 dark:text-yellow-200";
  const icon = hasErrors ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${bgColor} border-l-4 ${borderColor} ${textColor} p-4 rounded-r-md shadow-md`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {icon}
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-2">
                {hasErrors ? "Configuration Error" : "Configuration Warning"}
              </h3>
              <ul className="text-sm space-y-1">
                {status.errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
                {status.warnings.map((warning, idx) => (
                  <li key={idx}>⚠️ {warning}</li>
                ))}
              </ul>
              {hasErrors && (
                <p className="text-xs mt-2 opacity-75">
                  See SETUP_GUIDE.md for configuration instructions
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfigBanner;
