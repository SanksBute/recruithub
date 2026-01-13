import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Building2, Globe, MapPin } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Clients = () => {
  const { getAuthHeader, user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    industry: '',
    organization_type: '',
    headquarter_location: '',
    other_branches: '',
    website: '',
    core_business: '',
    contact_emails: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients`, getAuthHeader());
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        contact_emails: formData.contact_emails.split(',').map(e => e.trim()).filter(e => e)
      };
      await axios.post(`${API_URL}/clients`, payload, getAuthHeader());
      toast.success('Client created successfully!');
      setDialogOpen(false);
      setFormData({
        client_name: '',
        industry: '',
        organization_type: '',
        headquarter_location: '',
        other_branches: '',
        website: '',
        core_business: '',
        contact_emails: ''
      });
      fetchClients();
    } catch (error) {
      toast.error('Failed to create client');
    }
  };

  const canAddClient = ['admin', 'manager', 'team_leader'].includes(user?.role);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="clients-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope' }}>
            Clients
          </h1>
          <p className="text-slate-600 mt-2">{clients.length} total clients</p>
        </div>
        {canAddClient && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-client-button" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-500/20 transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: 'Manrope' }}>Add New Client</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name *</Label>
                    <Input
                      id="client_name"
                      data-testid="client-name-input"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization_type">Organization Type *</Label>
                    <Input
                      id="organization_type"
                      value={formData.organization_type}
                      onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headquarter_location">Headquarter Location *</Label>
                    <Input
                      id="headquarter_location"
                      value={formData.headquarter_location}
                      onChange={(e) => setFormData({ ...formData, headquarter_location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other_branches">Other Branches</Label>
                    <Input
                      id="other_branches"
                      value={formData.other_branches}
                      onChange={(e) => setFormData({ ...formData, other_branches: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="core_business">Core Business *</Label>
                  <Input
                    id="core_business"
                    value={formData.core_business}
                    onChange={(e) => setFormData({ ...formData, core_business: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_emails">Contact Emails (comma-separated)</Label>
                  <Input
                    id="contact_emails"
                    placeholder="email1@example.com, email2@example.com"
                    value={formData.contact_emails}
                    onChange={(e) => setFormData({ ...formData, contact_emails: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Create Client
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id} data-testid={`client-card-${client.id}`} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg" style={{ fontFamily: 'Manrope' }}>{client.client_name}</CardTitle>
                    <p className="text-sm text-slate-600">{client.industry}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4" />
                <span>{client.headquarter_location}</span>
              </div>
              {client.website && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Globe className="h-4 w-4" />
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    {client.website}
                  </a>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Core Business</p>
                <p className="text-sm text-slate-700">{client.core_business}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No clients found</p>
        </div>
      )}
    </div>
  );
};

export default Clients;