import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Plus, Calendar, Video, Phone, Users as UsersIcon } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Interviews = () => {
  const { getAuthHeader, user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    candidate_id: '',
    position_id: '',
    interview_mode: 'online',
    interview_date: '',
    action_plan: ''
  });

  useEffect(() => {
    fetchInterviews();
    fetchCandidates();
    fetchPositions();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/interviews`, getAuthHeader());
      setInterviews(response.data);
    } catch (error) {
      toast.error('Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(`${API_URL}/candidates`, getAuthHeader());
      setCandidates(response.data.filter(c => ['approved', 'shared_with_client'].includes(c.status)));
    } catch (error) {
      console.error('Failed to fetch candidates');
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
      await axios.post(
        `${API_URL}/interviews`,
        {
          ...formData,
          interview_date: new Date(formData.interview_date).toISOString()
        },
        getAuthHeader()
      );
      toast.success('Interview scheduled successfully!');
      setDialogOpen(false);
      fetchInterviews();
    } catch (error) {
      toast.error('Failed to schedule interview');
    }
  };

  const canScheduleInterview = ['admin', 'manager', 'team_leader'].includes(user?.role);

  const getModeIcon = (mode) => {
    const icons = {
      online: Video,
      face_to_face: UsersIcon,
      telephonic: Phone
    };
    return icons[mode] || Video;
  };

  const getModeColor = (mode) => {
    const colors = {
      online: 'bg-blue-100 text-blue-800',
      face_to_face: 'bg-green-100 text-green-800',
      telephonic: 'bg-purple-100 text-purple-800'
    };
    return colors[mode] || colors.online;
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="interviews-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope' }}>
            Interviews
          </h1>
          <p className="text-slate-600 mt-2">{interviews.length} scheduled interviews</p>
        </div>
        {canScheduleInterview && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="schedule-interview-button" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-500/20 transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: 'Manrope' }}>Schedule New Interview</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate_id">Candidate *</Label>
                  <Select value={formData.candidate_id} onValueChange={(value) => setFormData({ ...formData, candidate_id: value })} required>
                    <SelectTrigger data-testid="candidate-select">
                      <SelectValue placeholder="Select candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>{candidate.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position_id">Position *</Label>
                  <Select value={formData.position_id} onValueChange={(value) => setFormData({ ...formData, position_id: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>{position.job_title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interview_mode">Interview Mode *</Label>
                  <Select value={formData.interview_mode} onValueChange={(value) => setFormData({ ...formData, interview_mode: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="face_to_face">Face to Face</SelectItem>
                      <SelectItem value="telephonic">Telephonic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interview_date">Interview Date & Time *</Label>
                  <Input
                    id="interview_date"
                    data-testid="interview-date-input"
                    type="datetime-local"
                    value={formData.interview_date}
                    onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action_plan">Action Plan</Label>
                  <Textarea
                    id="action_plan"
                    value={formData.action_plan}
                    onChange={(e) => setFormData({ ...formData, action_plan: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Schedule Interview
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {interviews.map((interview) => {
          const candidate = candidates.find(c => c.id === interview.candidate_id);
          const position = positions.find(p => p.id === interview.position_id);
          const ModeIcon = getModeIcon(interview.interview_mode);
          const interviewDate = new Date(interview.interview_date);
          
          return (
            <Card key={interview.id} data-testid={`interview-card-${interview.id}`} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl" style={{ fontFamily: 'Manrope' }}>
                        {candidate?.name || 'Unknown Candidate'}
                      </CardTitle>
                      <p className="text-sm text-slate-600">{position?.job_title || 'Unknown Position'}</p>
                    </div>
                  </div>
                  <Badge className={getModeColor(interview.interview_mode)}>
                    <ModeIcon className="h-3 w-3 mr-1" />
                    {interview.interview_mode.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Interview Date</p>
                    <p className="text-sm text-slate-700 font-medium">
                      {interviewDate.toLocaleDateString()} at {interviewDate.toLocaleTimeString()}
                    </p>
                  </div>
                  {interview.action_plan && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Action Plan</p>
                      <p className="text-sm text-slate-700">{interview.action_plan}</p>
                    </div>
                  )}
                </div>
                {interview.feedback && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Feedback</p>
                    <p className="text-sm text-slate-700">{interview.feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {interviews.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No interviews scheduled</p>
        </div>
      )}
    </div>
  );
};

export default Interviews;