import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminPage({ user, logout, darkMode, toggleDarkMode }) {
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [resourceForm, setResourceForm] = useState({ name: '', type: 'person', availability: 'available', cost_per_hour: '' });

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Admin access required');
      return;
    }
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [usersRes, resourcesRes] = await Promise.all([
        axios.get(`${API}/users`, { headers }),
        axios.get(`${API}/resources`, { headers }),
      ]);
      setUsers(usersRes.data);
      setResources(resourcesRes.data);
    } catch (error) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/resources`, { ...resourceForm, cost_per_hour: parseFloat(resourceForm.cost_per_hour) || 0 }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Resource created!');
      setShowResourceDialog(false);
      setResourceForm({ name: '', type: 'person', availability: 'available', cost_per_hour: '' });
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create resource');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('User deleted!');
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/resources/${resourceId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Resource deleted!');
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete resource');
    }
  };

  if (user?.role !== 'admin') {
    return (<div className="flex min-h-screen items-center justify-center"><p className="text-lg text-destructive">Access Denied: Admin only</p></div>);
  }

  return (
    <div className="flex min-h-screen" data-testid="admin-page">
      <Sidebar user={user} logout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex-1 overflow-auto">
        <div className="bg-[hsl(var(--accent-mist))] border-b border-border">
          <div className="max-w-[1200px] mx-auto px-8 py-6">
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Manage users and resources</p>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-8 py-6 space-y-6">
          <Card className="shadow-[var(--shadow-1)]" data-testid="users-card">
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage user accounts and roles</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (<div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>) : users.length === 0 ? (<div className="text-center py-12 text-muted-foreground"><Shield className="h-16 w-16 mx-auto mb-4 opacity-50" /><p>No users found</p></div>) : (<Table><TableHeader><TableRow><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{users.map((usr) => (<TableRow key={usr.id} data-testid={`user-row-${usr.id}`}><TableCell className="font-medium">{usr.username}</TableCell><TableCell>{usr.email}</TableCell><TableCell><span className="px-2 py-1 text-xs rounded-full bg-[hsl(var(--accent-mist))] text-[hsl(var(--brand))] capitalize">{usr.role.replace('_', ' ')}</span></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => handleDeleteUser(usr.id)} data-testid={`delete-user-${usr.id}-button`}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>))}</TableBody></Table>)}
            </CardContent>
          </Card>
          <Card className="shadow-[var(--shadow-1)]" data-testid="resources-card">
            <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Resources</CardTitle><CardDescription>Manage project resources</CardDescription></div>
              <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}><DialogTrigger asChild><Button className="bg-[hsl(var(--brand))] hover:bg-[hsl(188_60%_30%)] text-white" data-testid="create-resource-button"><Plus className="mr-2 h-4 w-4" />New Resource</Button></DialogTrigger><DialogContent data-testid="create-resource-dialog"><DialogHeader><DialogTitle>Create Resource</DialogTitle><DialogDescription>Add a new resource</DialogDescription></DialogHeader><form onSubmit={handleCreateResource} className="space-y-4"><div className="space-y-2"><Label htmlFor="res-name">Name *</Label><Input id="res-name" value={resourceForm.name} onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })} required data-testid="resource-name-input" /></div><div className="space-y-2"><Label>Type</Label><Select value={resourceForm.type} onValueChange={(value) => setResourceForm({ ...resourceForm, type: value })}><SelectTrigger data-testid="resource-type-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="person">Person</SelectItem><SelectItem value="equipment">Equipment</SelectItem><SelectItem value="software">Software</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="res-cost">Cost per Hour</Label><Input id="res-cost" type="number" step="0.01" value={resourceForm.cost_per_hour} onChange={(e) => setResourceForm({ ...resourceForm, cost_per_hour: e.target.value })} data-testid="resource-cost-input" /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setShowResourceDialog(false)}>Cancel</Button><Button type="submit" className="bg-[hsl(var(--brand))] hover:bg-[hsl(188_60%_30%)] text-white" data-testid="submit-resource-button">Create Resource</Button></DialogFooter></form></DialogContent></Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (<div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>) : resources.length === 0 ? (<div className="text-center py-12 text-muted-foreground"><p>No resources yet.</p></div>) : (<Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Availability</TableHead><TableHead>Cost/Hour</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{resources.map((res) => (<TableRow key={res.id} data-testid={`resource-row-${res.id}`}><TableCell className="font-medium">{res.name}</TableCell><TableCell className="capitalize">{res.type}</TableCell><TableCell><span className={`px-2 py-1 text-xs rounded-full ${res.availability === 'available' ? 'bg-[hsl(var(--success)/.2)] text-[hsl(var(--success))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>{res.availability}</span></TableCell><TableCell className="font-mono">${res.cost_per_hour?.toFixed(2) || '0.00'}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => handleDeleteResource(res.id)} data-testid={`delete-resource-${res.id}-button`}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>))}</TableBody></Table>)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}