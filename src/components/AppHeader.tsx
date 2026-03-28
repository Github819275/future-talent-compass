import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  right?: ReactNode;
}

const AppHeader = ({ right }: Props) => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground tracking-tight">FutureProof</h1>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Decision Intelligence</p>
          </div>
        </button>
        {right}
      </div>
    </header>
  );
};

export default AppHeader;
