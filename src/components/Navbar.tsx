import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MessageSquare, LayoutDashboard, LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          SkillSim AI
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Skills
          </Link>
          <Link to="/characters" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Characters
          </Link>
          {user ? (
            <>
              <Link to="/history" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                History
              </Link>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-3">
            <Link to="/categories" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Skills</Link>
            <Link to="/characters" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Characters</Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button>
              </>
            ) : (
              <Button size="sm" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>Get Started</Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
