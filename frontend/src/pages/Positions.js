import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Plus, Briefcase, MapPin, Users as UsersIcon } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Positions = () => {
  const { getAuthHeader, user } = useAuth();
  const [positions, setPositions] = useState([]);
  const [clients, setClients] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    job_title: '',
    department: '',
    num_openings: 1,
    reason_for_hiring: '',
    team_size: '',
    location: '',
    work_mode: 'hybrid',
    working_days: '',
    qualification: '',
    experience: '',
    must_have_skills: '',
    good_to_have_skills: '',
    gender_preference: '',
    assigned_recruiters: []
  });

  useEffect(() => {
    fetchPositions();
    fetchClients();
    if (['admin', 'manager', 'team_leader'].includes(user?.role)) {
      fetchRecruiters();
    }
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await axios.get(`${API_URL}/positions`, getAuthHeader());
      setPositions(response.data);
    } catch (error) {
      toast.error('Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients`, getAuthHeader());
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients');
    }
  };

  const fetchRecruiters = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, getAuthHeader());
      setRecruiters(response.data.filter(u => u.role === 'recruiter'));
    } catch (error) {
      console.error('Failed to fetch recruiters');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        num_openings: parseInt(formData.num_openings),
        team_size: formData.team_size ? parseInt(formData.team_size) : null,
        must_have_skills: formData.must_have_skills.split(',').map(s => s.trim()).filter(s => s),
        good_to_have_skills: formData.good_to_have_skills.split(',').map(s => s.trim()).filter(s => s)
      };
      await axios.post(`${API_URL}/positions`, payload, getAuthHeader());
      toast.success('Position created successfully!');
      setDialogOpen(false);
      fetchPositions();
    } catch (error) {
      toast.error('Failed to create position');
    }
  };

  const canAddPosition = ['admin', 'manager', 'team_leader'].includes(user?.role);

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.open;
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="positions-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope' }}>
            Positions
          </h1>
          <p className="text-slate-600 mt-2">{positions.length} total positions</p>
        </div>
        {canAddPosition && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-position-button" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-500/20 transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Add Position
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: 'Manrope' }}>Add New Position</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_id">Client *</Label>
                    <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })} required>
                      <SelectTrigger data-testid="client-select">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>{client.client_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title *</Label>
                    <Input
                      id="job_title"
                      data-testid="job-title-input"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="num_openings">Number of Openings *</Label>
                    <Input
                      id="num_openings"
                      type="number"
                      min="1"
                      value={formData.num_openings}
                      onChange={(e) => setFormData({ ...formData, num_openings: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work_mode">Work Mode *</Label>
                    <Select value={formData.work_mode} onValueChange={(value) => setFormData({ ...formData, work_mode: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onsite">Onsite</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="working_days">Working Days *</Label>
                    <Input
                      id="working_days"
                      placeholder="e.g., Monday - Friday"
                      value={formData.working_days}
                      onChange={(e) => setFormData({ ...formData, working_days: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification *</Label>
                    <Input
                      id="qualification"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience *</Label>
                    <Input
                      id="experience"
                      placeholder="e.g., 3-5 years"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team_size">Team Size</Label>
                    <Input
                      id="team_size"
                      type="number"
                      value={formData.team_size}
                      onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason_for_hiring">Reason for Hiring *</Label>
                  <Input
                    id="reason_for_hiring"
                    value={formData.reason_for_hiring}
                    onChange={(e) => setFormData({ ...formData, reason_for_hiring: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="must_have_skills">Must Have Skills (comma-separated) *</Label>
                  <Input
                    id="must_have_skills"
                    placeholder="React, Node.js, MongoDB"
                    value={formData.must_have_skills}
                    onChange={(e) => setFormData({ ...formData, must_have_skills: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="good_to_have_skills">Good to Have Skills (comma-separated)</Label>
                  <Input
                    id="good_to_have_skills"
                    placeholder="TypeScript, Docker"
                    value={formData.good_to_have_skills}
                    onChange={(e) => setFormData({ ...formData, good_to_have_skills: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Create Position
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {positions.map((position) => {
          const client = clients.find(c => c.id === position.client_id);
          return (
            <Card key={position.id} data-testid={`position-card-${position.id}`} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl" style={{ fontFamily: 'Manrope' }}>{position.job_title}</CardTitle>
                      <p className="text-sm text-slate-600">{client?.client_name}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(position.status)}>{position.status.replace('_', ' ')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Department</p>
                    <p className="text-sm text-slate-700">{position.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Openings</p>
                    <p className="text-sm text-slate-700">{position.num_openings}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-sm text-slate-700">{position.experience}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{position.location}</span>
                  </div>
                  <Badge variant="outline" className="capitalize">{position.work_mode}</Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Must Have Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {position.must_have_skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {positions.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No positions found</p>
        </div>
      )}
    </div>
  );
};

export default Positions;