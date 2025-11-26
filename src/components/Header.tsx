import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">
          Abra Heritage
        </Link>
        <Link to="/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <Shield className="w-4 h-4" />
            Admin
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
