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
import { Plus, User, Mail, Phone, MapPin } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Candidates = () => {
  const { getAuthHeader } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    position_id: '',
    name: '',
    email: '',
    contact_number: '',
    qualification: '',
    industry_sector: '',
    current_designation: '',
    department: '',
    current_location: '',
    current_ctc: '',
    years_of_experience: '',
    expected_ctc: '',
    notice_period: ''
  });

  useEffect(() => {
    fetchCandidates();
    fetchPositions();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(`${API_URL}/candidates`, getAuthHeader());
      setCandidates(response.data);
    } catch (error) {
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await axios.get(`${API_URL}/positions`, getAuthHeader());
      setPositions(response.data);
    } catch (error) {
      console.error('Failed to fetch positions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        current_ctc: parseFloat(formData.current_ctc),
        expected_ctc: parseFloat(formData.expected_ctc),
        years_of_experience: parseFloat(formData.years_of_experience)
      };
      await axios.post(`${API_URL}/candidates`, payload, getAuthHeader());
      toast.success('Candidate added successfully!');
      setDialogOpen(false);
      fetchCandidates();
    } catch (error) {
      toast.error('Failed to add candidate');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      sourced: 'bg-slate-100 text-slate-800',
      shortlisted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      shared_with_client: 'bg-purple-100 text-purple-800',
      interview_scheduled: 'bg-orange-100 text-orange-800',
      selected: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || colors.sourced;
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="candidates-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope' }}>
            Candidates
          </h1>
          <p className="text-slate-600 mt-2">{candidates.length} total candidates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-candidate-button" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-500/20 transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Manrope' }}>Add New Candidate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position_id">Position *</Label>
                <Select value={formData.position_id} onValueChange={(value) => setFormData({ ...formData, position_id: value })} required>
                  <SelectTrigger data-testid="position-select">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position.id} value={position.id}>{position.job_title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    data-testid="candidate-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number *</Label>
                  <Input
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
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
                  <Label htmlFor="industry_sector">Industry Sector *</Label>
                  <Input
                    id="industry_sector"
                    value={formData.industry_sector}
                    onChange={(e) => setFormData({ ...formData, industry_sector: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_designation">Current Designation *</Label>
                  <Input
                    id="current_designation"
                    value={formData.current_designation}
                    onChange={(e) => setFormData({ ...formData, current_designation: e.target.value })}
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
                  <Label htmlFor="current_location">Current Location *</Label>
                  <Input
                    id="current_location"
                    value={formData.current_location}
                    onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_ctc">Current CTC (LPA) *</Label>
                  <Input
                    id="current_ctc"
                    type="number"
                    step="0.1"
                    value={formData.current_ctc}
                    onChange={(e) => setFormData({ ...formData, current_ctc: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected_ctc">Expected CTC (LPA) *</Label>
                  <Input
                    id="expected_ctc"
                    type="number"
                    step="0.1"
                    value={formData.expected_ctc}
                    onChange={(e) => setFormData({ ...formData, expected_ctc: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years_of_experience">Years of Experience *</Label>
                  <Input
                    id="years_of_experience"
                    type="number"
                    step="0.1"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notice_period">Notice Period *</Label>
                  <Input
                    id="notice_period"
                    placeholder="e.g., 30 days"
                    value={formData.notice_period}
                    onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                Add Candidate
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => {
          const position = positions.find(p => p.id === candidate.position_id);
          return (
            <Card key={candidate.id} data-testid={`candidate-card-${candidate.id}`} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg" style={{ fontFamily: 'Manrope' }}>{candidate.name}</CardTitle>
                      <p className="text-sm text-slate-600">{candidate.current_designation}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(candidate.status)}>{candidate.status.replace('_', ' ')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {position && (
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Position</p>
                    <p className="text-sm text-slate-700 font-medium">{position.job_title}</p>
                  </div>
                )}
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{candidate.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{candidate.contact_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{candidate.current_location}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-sm text-slate-700 font-medium">{candidate.years_of_experience} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected CTC</p>
                    <p className="text-sm text-slate-700 font-medium">₹{candidate.expected_ctc} LPA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {candidates.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No candidates found</p>
        </div>
      )}
    </div>
  );
};

export default Candidates;