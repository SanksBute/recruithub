import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Search, User, Mail, MapPin } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CandidateSearch = () => {
  const { getAuthHeader } = useAuth();
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    current_city: '',
    min_experience: '',
    max_experience: '',
    min_salary: '',
    max_salary: '',
    qualification: '',
    industry: '',
    department: '',
    designation: ''
  });
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    
    try {
      const cleanParams = {};
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key]) {
          cleanParams[key] = searchParams[key];
        }
      });
      
      if (cleanParams.min_experience) cleanParams.min_experience = parseFloat(cleanParams.min_experience);
      if (cleanParams.max_experience) cleanParams.max_experience = parseFloat(cleanParams.max_experience);
      if (cleanParams.min_salary) cleanParams.min_salary = parseFloat(cleanParams.min_salary);
      if (cleanParams.max_salary) cleanParams.max_salary = parseFloat(cleanParams.max_salary);
      
      const response = await axios.post(`${API_URL}/candidates/search`, cleanParams, getAuthHeader());
      setResults(response.data);
      toast.success(`Found ${response.data.length} candidates`);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
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

  return (
    <div data-testid="search-container" className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope' }}>
          Search Candidates
        </h1>
        <p className="text-slate-600 mt-2">Advanced search with multiple filters</p>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Manrope' }}>Search Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  data-testid="search-keywords-input"
                  placeholder="Name, designation, etc."
                  value={searchParams.keywords}
                  onChange={(e) => setSearchParams({ ...searchParams, keywords: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_city">Current City</Label>
                <Input
                  id="current_city"
                  value={searchParams.current_city}
                  onChange={(e) => setSearchParams({ ...searchParams, current_city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={searchParams.qualification}
                  onChange={(e) => setSearchParams({ ...searchParams, qualification: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={searchParams.industry}
                  onChange={(e) => setSearchParams({ ...searchParams, industry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={searchParams.department}
                  onChange={(e) => setSearchParams({ ...searchParams, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={searchParams.designation}
                  onChange={(e) => setSearchParams({ ...searchParams, designation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_experience">Min Experience (years)</Label>
                <Input
                  id="min_experience"
                  type="number"
                  step="0.1"
                  value={searchParams.min_experience}
                  onChange={(e) => setSearchParams({ ...searchParams, min_experience: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_experience">Max Experience (years)</Label>
                <Input
                  id="max_experience"
                  type="number"
                  step="0.1"
                  value={searchParams.max_experience}
                  onChange={(e) => setSearchParams({ ...searchParams, max_experience: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_salary">Min Salary (LPA)</Label>
                <Input
                  id="min_salary"
                  type="number"
                  step="0.1"
                  value={searchParams.min_salary}
                  onChange={(e) => setSearchParams({ ...searchParams, min_salary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_salary">Max Salary (LPA)</Label>
                <Input
                  id="max_salary"
                  type="number"
                  step="0.1"
                  value={searchParams.max_salary}
                  onChange={(e) => setSearchParams({ ...searchParams, max_salary: e.target.value })}
                />
              </div>
            </div>
            <Button data-testid="search-button" type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={searching}>
              <Search className="mr-2 h-4 w-4" />
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Manrope' }}>
            Search Results ({results.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((candidate) => (
              <Card key={candidate.id} data-testid={`search-result-${candidate.id}`} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateSearch;