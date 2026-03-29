import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import bmwLogo from "@/assets/bmw-logo.png";

interface Props {
  right?: ReactNode;
}

const AppHeader = ({ right }: Props) => {
  const navigate = useNavigate();

  return (
    <header className="bg-foreground/95 backdrop-blur-xl sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img src={bmwLogo} alt="BMW" className="w-9 h-9" width={36} height={36} />
          <div className="h-5 w-px bg-white/20" />
          <span className="text-xs font-medium text-white/70 tracking-widest uppercase">Talent Intelligence</span>
        </button>
        {right}
      </div>
    </header>
  );
};

export default AppHeader;
