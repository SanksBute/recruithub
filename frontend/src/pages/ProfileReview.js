import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, User, Mail, MapPin, AlertCircle } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfileReview = () => {
  const { getAuthHeader } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState({});

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(`${API_URL}/candidates`, getAuthHeader());
      setCandidates(response.data.filter(c => ['sourced', 'shortlisted'].includes(c.status)));
    } catch (error) {
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (candidateId, action) => {
    try {
      const payload = {
        candidate_id: candidateId,
        action: action,
        reason: action === 'reject' ? rejectionReason[candidateId] : undefined
      };
      
      if (action === 'reject' && !payload.reason) {
        toast.error('Rejection reason is required');
        return;
      }
      
      await axios.post(`${API_URL}/candidates/${candidateId}/action`, payload, getAuthHeader());
      toast.success(`Candidate ${action}ed successfully!`);
      setRejectionReason({ ...rejectionReason, [candidateId]: '' });
      fetchCandidates();
    } catch (error) {
      toast.error(`Failed to ${action} candidate`);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="review-container" className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope' }}>
          Review Profiles
        </h1>
        <p className="text-slate-600 mt-2">{candidates.length} profiles pending review</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {candidates.map((candidate) => (
          <Card key={candidate.id} data-testid={`review-card-${candidate.id}`} className="bg-white border-slate-200 shadow-sm rounded-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl" style={{ fontFamily: 'Manrope' }}>{candidate.name}</CardTitle>
                    <p className="text-slate-600">{candidate.current_designation}</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">{candidate.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Qualification</p>
                  <p className="text-sm text-slate-700">{candidate.qualification}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Experience</p>
                  <p className="text-sm text-slate-700">{candidate.years_of_experience} years</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current CTC</p>
                  <p className="text-sm text-slate-700">₹{candidate.current_ctc} LPA</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected CTC</p>
                  <p className="text-sm text-slate-700">₹{candidate.expected_ctc} LPA</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{candidate.current_location}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="space-y-3">
                  <Textarea
                    data-testid={`rejection-reason-${candidate.id}`}
                    placeholder="Enter rejection reason (required for rejection)"
                    value={rejectionReason[candidate.id] || ''}
                    onChange={(e) => setRejectionReason({ ...rejectionReason, [candidate.id]: e.target.value })}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-3">
                    <Button
                      data-testid={`shortlist-button-${candidate.id}`}
                      onClick={() => handleAction(candidate.id, 'shortlist')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Shortlist
                    </Button>
                    <Button
                      data-testid={`approve-button-${candidate.id}`}
                      onClick={() => handleAction(candidate.id, 'approve')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      data-testid={`reject-button-${candidate.id}`}
                      onClick={() => handleAction(candidate.id, 'reject')}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {candidates.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No profiles pending review</p>
        </div>
      )}
    </div>
  );
};

export default ProfileReview;