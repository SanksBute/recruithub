import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Building2, Briefcase, Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import EmailSettings from '../components/EmailSettings';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const { getAuthHeader, user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`, getAuthHeader());
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    const roleTitles = {
      admin: 'Admin Dashboard',
      manager: 'Manager Dashboard',
      team_leader: 'Team Leader Dashboard',
      recruiter: 'Recruiter Dashboard'
    };
    return roleTitles[user?.role] || 'Dashboard';
  };

  const statCards = [
    { 
      title: stats.total_clients ? 'Total Clients' : 'Assigned Clients', 
      value: stats.total_clients || stats.assigned_clients || 0, 
      icon: Building2, 
      color: 'indigo',
      show: true
    },
    { 
      title: stats.total_positions ? 'Total Positions' : 'Assigned Positions', 
      value: stats.total_positions || stats.assigned_positions || 0, 
      icon: Briefcase, 
      color: 'purple',
      show: true
    },
    { 
      title: 'Profiles Shared', 
      value: stats.profiles_shared || 0, 
      icon: Users, 
      color: 'green',
      show: true
    },
    { 
      title: 'Interviews Scheduled', 
      value: stats.interviews_scheduled || 0, 
      icon: Calendar, 
      color: 'orange',
      show: true
    },
    { 
      title: 'Candidates Selected', 
      value: stats.candidates_selected || 0, 
      icon: TrendingUp, 
      color: 'emerald',
      show: true
    },
    { 
      title: 'Feedback Pending', 
      value: stats.feedback_pending || 0, 
      icon: AlertCircle, 
      color: 'amber',
      show: true
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      indigo: 'bg-indigo-50 text-indigo-600',
      purple: 'bg-purple-50 text-purple-600',
      green: 'bg-green-50 text-green-600',
      orange: 'bg-orange-50 text-orange-600',
      emerald: 'bg-emerald-50 text-emerald-600',
      amber: 'bg-amber-50 text-amber-600'
    };
    return colors[color] || colors.indigo;
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="dashboard-container" className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope' }}>
            {getRoleTitle()}
          </h1>
          <p className="text-slate-600 mt-2">Welcome back, {user?.name}</p>
        </div>
        <EmailSettings />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.filter(card => card.show).map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} data-testid={`stat-card-${card.title.toLowerCase().replace(/ /g, '-')}`} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg ${getColorClasses(card.color)}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Manrope' }}>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {user?.role !== 'recruiter' && (
              <a href="/clients" className="p-4 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-all border border-indigo-100">
                <Building2 className="h-6 w-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold text-slate-900">Manage Clients</h3>
                <p className="text-sm text-slate-600">Add and manage clients</p>
              </a>
            )}
            <a href="/positions" className="p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-all border border-purple-100">
              <Briefcase className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-slate-900">View Positions</h3>
              <p className="text-sm text-slate-600">Browse open positions</p>
            </a>
            <a href="/candidates" className="p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-all border border-green-100">
              <Users className="h-6 w-6 text-green-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Add Candidates</h3>
              <p className="text-sm text-slate-600">Upload new candidates</p>
            </a>
            {['admin', 'manager', 'team_leader'].includes(user?.role) && (
              <a href="/review" className="p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-all border border-orange-100">
                <Calendar className="h-6 w-6 text-orange-600 mb-2" />
                <h3 className="font-semibold text-slate-900">Review Profiles</h3>
                <p className="text-sm text-slate-600">Approve or reject</p>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;