import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Send, FileText, Mail, AlertCircle } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfileSharing = () => {
  const { getAuthHeader } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [pdfBase64, setPdfBase64] = useState('');
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    fetchCandidates();
    fetchClients();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(`${API_URL}/candidates`, getAuthHeader());
      setCandidates(response.data.filter(c => c.status === 'approved'));
    } catch (error) {
      toast.error('Failed to fetch candidates');
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

  const toggleCandidate = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleGeneratePDF = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }

    if (selectedCandidates.length === 1) {
      const confirmed = window.confirm('You have selected only one profile. Do you want to proceed?');
      if (!confirmed) return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/candidates/generate-pdf`,
        selectedCandidates,
        getAuthHeader()
      );
      setPdfBase64(response.data.pdf_base64);
      setShowPdfDialog(true);
      toast.success('PDF generated successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const handlePrepareEmail = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }

    try {
      // First generate PDF
      const pdfResponse = await axios.post(
        `${API_URL}/candidates/generate-pdf`,
        selectedCandidates,
        getAuthHeader()
      );
      setPdfBase64(pdfResponse.data.pdf_base64);
      
      // Get client emails
      const selectedCandidateData = candidates.filter(c => selectedCandidates.includes(c.id));
      const clientEmails = new Set();
      
      for (const candidate of selectedCandidateData) {
        const position = await axios.get(`${API_URL}/positions/${candidate.position_id}`, getAuthHeader());
        const client = clients.find(c => c.id === position.data.client_id);
        if (client && client.contact_emails) {
          client.contact_emails.forEach(email => clientEmails.add(email));
        }
      }

      const subject = `Candidate Profiles - ${selectedCandidates.length} Candidate${selectedCandidates.length > 1 ? 's' : ''}`;
      const body = `Dear Client,\n\nPlease find attached ${selectedCandidates.length} candidate profile${selectedCandidates.length > 1 ? 's' : ''} for your review.\n\nBest regards,\nRecruitHub Team`;

      setEmailData({
        to: Array.from(clientEmails).join(', '),
        subject,
        body
      });
      setShowEmailDialog(true);
    } catch (error) {
      toast.error('Failed to prepare email');
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/email/send`,
        {
          to: emailData.to.split(',').map(e => e.trim()),
          subject: emailData.subject,
          body: emailData.body,
          candidate_ids: selectedCandidates,
          attachment_base64: pdfBase64,
          attachment_filename: `candidates_${new Date().getTime()}.pdf`
        },
        getAuthHeader()
      );
      toast.success('Email sent successfully! Profiles marked as shared.');
      setShowEmailDialog(false);
      setSelectedCandidates([]);
      setPdfBase64('');
      fetchCandidates();
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('not configured')) {
        toast.error('Email not configured. Please ask admin to configure SMTP settings first.');
      } else if (error.response?.status === 401) {
        toast.error('Email authentication failed. Please check SMTP credentials.');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to send email');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="share-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope' }}>
            Share Profiles
          </h1>
          <p className="text-slate-600 mt-2">{selectedCandidates.length} selected</p>
        </div>
        <div className="flex gap-3">
          <Button
            data-testid="generate-pdf-button"
            onClick={handleGeneratePDF}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={selectedCandidates.length === 0}
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
          <Button
            data-testid="compose-email-button"
            onClick={handlePrepareEmail}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={selectedCandidates.length === 0}
          >
            <Mail className="mr-2 h-4 w-4" />
            Compose Email
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <Card key={candidate.id} data-testid={`share-card-${candidate.id}`} className={`bg-white border-2 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl ${
            selectedCandidates.includes(candidate.id) ? 'border-indigo-500' : 'border-slate-200'
          }`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg" style={{ fontFamily: 'Manrope' }}>{candidate.name}</CardTitle>
                  <p className="text-sm text-slate-600">{candidate.current_designation}</p>
                </div>
                <Checkbox
                  data-testid={`checkbox-${candidate.id}`}
                  checked={selectedCandidates.includes(candidate.id)}
                  onCheckedChange={() => toggleCandidate(candidate.id)}
                  className="mt-1"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Experience</p>
                  <p className="text-sm text-slate-700 font-medium">{candidate.years_of_experience} years</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected CTC</p>
                  <p className="text-sm text-slate-700 font-medium">₹{candidate.expected_ctc} LPA</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm text-slate-700">{candidate.current_location}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {candidates.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No approved profiles available for sharing</p>
        </div>
      )}

      {/* PDF Preview Dialog */}
      <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Manrope' }}>PDF Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-100 rounded-lg p-4 text-center">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">PDF Generated Successfully</p>
              <p className="text-sm text-slate-500 mt-1">Contact details are hidden in the PDF</p>
            </div>
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${pdfBase64}`;
                link.download = `candidates_${new Date().getTime()}.pdf`;
                link.click();
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Manrope' }}>Compose Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                data-testid="email-to-input"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                placeholder="client@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                data-testid="email-subject-input"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                data-testid="email-body-input"
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                rows={6}
              />
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This creates an email draft. In production, this would integrate with your email service.
              </p>
            </div>
            <Button
              data-testid="send-email-button"
              onClick={handleSendEmail}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Create Draft & Mark as Shared
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSharing;