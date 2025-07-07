import type { LucideIcon } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import type { ReactNode } from "react";

interface PageHeaderBadge {
  label: string;
  icon?: LucideIcon;
  color?: string;
}

interface PageHeaderAction {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

interface PageHeaderProps {
  title: string;
  icon: LucideIcon;
  description: string;
  badges?: PageHeaderBadge[];
  actions?: PageHeaderAction[];
  gradient?: "primary" | "green" | "blue" | "purple" | "cyan" | "orange";
  children?: ReactNode;
}

export function PageHeader({
  title,
  icon: Icon,
  description,
  badges = [],
  actions = [],
  gradient = "primary",
  children,
}: PageHeaderProps) {
  const getGradientClass = (gradient: string) => {
    switch (gradient) {
      case "green":
        return "bg-gradient-to-r from-primary/20 via-transparent to-green-500/20";
      case "blue":
        return "bg-gradient-to-r from-primary/20 via-transparent to-blue-500/20";
      case "purple":
        return "bg-gradient-to-r from-primary/20 via-transparent to-purple-500/20";
      case "cyan":
        return "bg-gradient-to-r from-primary/20 via-transparent to-cyan-500/20";
      case "orange":
        return "bg-gradient-to-r from-primary/20 via-transparent to-orange-500/20";
      default:
        return "bg-gradient-to-r from-primary/20 via-transparent to-cyan-500/20";
    }
  };

  return (
    <div className="gradient-primary p-2 relative overflow-hidden md:mt-0 mt-24">
      <div className={`absolute inset-0 ${getGradientClass(gradient)}`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-0.5">
          <div className="text-sm font-bold text-primary-foreground flex items-center gap-2">
            <Icon className="w-3 h-3" />
            {title}
          </div>
          <div className="flex items-center gap-1">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`text-xs text-primary-foreground border-opacity-30 ${
                  badge.color ||
                  "bg-primary-foreground/10 border-primary-foreground/30"
                }`}
              >
                {badge.icon && <badge.icon className="w-3 h-3 mr-1" />}
                {badge.label}
              </Badge>
            ))}
            {actions.map((action, index) => (
              <Button
                key={index}
                size={action.size || "sm"}
                variant={action.variant || "outline"}
                className="text-xs border-primary-foreground/30 text-primary-foreground"
                onClick={action.onClick}
              >
                {action.icon && <action.icon className="w-3 h-3 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/80">{description}</p>
        {children}
      </div>
    </div>
  );
}
