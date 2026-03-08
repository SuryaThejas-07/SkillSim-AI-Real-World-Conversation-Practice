import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      {illustration && (
        <img
          src={illustration}
          alt=""
          className="h-32 w-32 object-contain mb-6 opacity-50"
        />
      )}

      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <div className="text-3xl">{icon}</div>
        </div>
      )}

      <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>

      {description && (
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="flex gap-3 justify-center">
          {action && (
            <Button onClick={action.onClick} size="lg">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="lg"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};
