import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Settings, Mail, Send, Loader2 } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EmailSettings = () => {
  const { getAuthHeader, user } = useAuth();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [config, setConfig] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    use_tls: true
  });
  const [hasConfig, setHasConfig] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkEmailConfig();
  }, []);

  const checkEmailConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/email/config`, getAuthHeader());
      setHasConfig(true);
      setConfig({ ...config, ...response.data, smtp_password: '' });
    } catch (error) {
      setHasConfig(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API_URL}/email/configure`, config, getAuthHeader());
      toast.success('Email configuration saved!');
      setConfigDialogOpen(false);
      setHasConfig(true);
    } catch (error) {
      toast.error('Failed to save email configuration');
    } finally {
      setLoading(false);
    }
  };

  const smtpPresets = {
    gmail: { smtp_host: 'smtp.gmail.com', smtp_port: 587, use_tls: true },
    outlook: { smtp_host: 'smtp-mail.outlook.com', smtp_port: 587, use_tls: true },
    office365: { smtp_host: 'smtp.office365.com', smtp_port: 587, use_tls: true }
  };

  const applyPreset = (preset) => {
    setConfig({ ...config, ...smtpPresets[preset] });
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setConfigDialogOpen(true)}
        data-testid="email-settings-button"
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        {hasConfig ? 'Email Configured' : 'Configure Email'}
      </Button>

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Manrope' }}>Email Configuration</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => applyPreset('gmail')}>
                Gmail
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('outlook')}>
                Outlook
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('office365')}>
                Office 365
              </Button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host *</Label>
                  <Input
                    value={config.smtp_host}
                    onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port *</Label>
                  <Input
                    type="number"
                    value={config.smtp_port}
                    onChange={(e) => setConfig({ ...config, smtp_port: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>SMTP Username (Email) *</Label>
                <Input
                  type="email"
                  value={config.smtp_user}
                  onChange={(e) => setConfig({ ...config, smtp_user: e.target.value })}
                  placeholder="your-email@gmail.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>SMTP Password *</Label>
                <Input
                  type="password"
                  value={config.smtp_password}
                  onChange={(e) => setConfig({ ...config, smtp_password: e.target.value })}
                  placeholder={hasConfig ? 'Leave blank to keep current password' : 'Enter password'}
                  required={!hasConfig}
                />
                <p className="text-xs text-slate-500">
                  For Gmail: Use App Password, not your regular password
                </p>
              </div>

              <div className="space-y-2">
                <Label>From Email *</Label>
                <Input
                  type="email"
                  value={config.from_email}
                  onChange={(e) => setConfig({ ...config, from_email: e.target.value })}
                  placeholder="noreply@company.com"
                  required
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Gmail Setup Instructions:</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Enable 2-Step Verification in your Google Account</li>
                  <li>Go to Security Settings → App Passwords</li>
                  <li>Generate a new app password for 'Mail'</li>
                  <li>Use that app password here</li>
                </ol>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailSettings;