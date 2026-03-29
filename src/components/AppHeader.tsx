import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import bmwLogo from "@/assets/bmw-logo.png";

interface Props {
  right?: ReactNode;
}

const AppHeader = ({ right }: Props) => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img src={bmwLogo} alt="BMW" className="w-10 h-10" width={40} height={40} />
          <div>
            <h1 className="font-display font-bold text-lg text-foreground tracking-tight">BMW Group</h1>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Talent Intelligence</p>
          </div>
        </button>
        {right}
      </div>
    </header>
  );
};

export default AppHeader;
