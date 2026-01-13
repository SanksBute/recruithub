import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  Users, 
  Search, 
  CheckSquare, 
  Send, 
  Calendar, 
  UserCog, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'team_leader', 'recruiter'] },
    { path: '/clients', icon: Building2, label: 'Clients', roles: ['admin', 'manager', 'team_leader', 'recruiter'] },
    { path: '/positions', icon: Briefcase, label: 'Positions', roles: ['admin', 'manager', 'team_leader', 'recruiter'] },
    { path: '/candidates', icon: Users, label: 'Candidates', roles: ['admin', 'manager', 'team_leader', 'recruiter'] },
    { path: '/search', icon: Search, label: 'Search', roles: ['admin', 'manager', 'team_leader', 'recruiter'] },
    { path: '/review', icon: CheckSquare, label: 'Review Profiles', roles: ['admin', 'manager', 'team_leader'] },
    { path: '/share', icon: Send, label: 'Share Profiles', roles: ['admin', 'manager', 'team_leader'] },
    { path: '/interviews', icon: Calendar, label: 'Interviews', roles: ['admin', 'manager', 'team_leader', 'recruiter'] },
    { path: '/users', icon: UserCog, label: 'Users', roles: ['admin', 'manager'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-slate-800 px-6">
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Manrope' }}>RecruitHub</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-500'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-slate-800 p-4">
            <div className="mb-3 rounded-lg bg-slate-800 p-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <Button
              variant="ghost"
              data-testid="logout-button"
              className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        data-testid="mobile-menu-button"
        className="fixed left-4 top-4 z-50 rounded-lg bg-slate-900 p-2 text-white lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;