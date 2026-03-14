import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function PageHeader({ title, onBack }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <header className="flex items-center gap-3 px-4 pt-6 pb-4">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center justify-center w-9 h-9 rounded-full glass-card hover:bg-white/10 transition-colors"
      >
        <ChevronLeft size={20} className="text-foreground" />
      </button>
      <h1 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h1>
    </header>
  );
}
