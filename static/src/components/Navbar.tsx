import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, LogOut, LayoutDashboard, BookOpen, Home } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 font-bold text-lg text-foreground">
          <Car className="h-6 w-6 text-primary" />
          <span>SmartPark</span>
        </button>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4 mr-1" /> Home
              </Button>

              {user.role === "user" && (
                <>
                  <Button
                    variant={isActive("/dashboard") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
                  </Button>
                  <Button
                    variant={isActive("/my-bookings") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate("/my-bookings")}
                  >
                    <BookOpen className="h-4 w-4 mr-1" /> My Bookings
                  </Button>
                </>
              )}

              {user.role === "admin" && (
                <Button
                  variant={isActive("/admin") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate("/admin")}
                >
                  <LayoutDashboard className="h-4 w-4 mr-1" /> Admin
                </Button>
              )}

              <span className="text-sm text-muted-foreground hidden sm:inline ml-2">
                {user.name} ({user.role})
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
