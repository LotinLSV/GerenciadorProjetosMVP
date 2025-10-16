import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Plus, Lock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProjectDetailPage({ user, logout, darkMode, toggleDarkMode }) {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [costs, setCosts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [showDocDialog, setShowDocDialog] = useState(false);
  
  const [taskForm, setTaskForm] = useState({ name: '', description: '', status: 'todo', priority: 'medium' });
  const [costForm, setCostForm] = useState({ category: '', amount: '', date: '', description: '' });
  const [docForm, setDocForm] = useState({ filename: '', category: 'project-documents', file_path: '' });

  useEffect(() => {
    if (projectId) fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [projectRes, tasksRes, costsRes, docsRes] = await Promise.all([
        axios.get(`${API}/projects/${projectId}`, { headers }),
        axios.get(`${API}/tasks?project_id=${projectId}`, { headers }),
        axios.get(`${API}/costs?project_id=${projectId}`, { headers }),
        axios.get(`${API}/documents?project_id=${projectId}`, { headers }),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setCosts(costsRes.data);
      setDocuments(docsRes.data);
    } catch (error) {
      toast.error('Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/tasks`, { ...taskForm, project_id: projectId }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Task created!');
      setShowTaskDialog(false);
      setTaskForm({ name: '', description: '', status: 'todo', priority: 'medium' });
      fetchProjectDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create task');
    }
  };

  const handleFreezeTask = async (taskId, currentFrozenState) => {
    if (currentFrozenState) return toast.info('Task is already frozen');
    try {
      const token = localStorage.getItem('token');
      const task = tasks.find(t => t.id === taskId);
      await axios.post(`${API}/baselines/task?task_id=${taskId}`, { name: `Baseline - ${new Date().toISOString()}`, snapshot_data: task }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Task baseline frozen!');
      fetchProjectDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to freeze task');
    }
  };

  const handleCreateCost = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/costs`, { ...costForm, project_id: projectId, amount: parseFloat(costForm.amount) }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Cost added!');
      setShowCostDialog(false);
      setCostForm({ category: '', amount: '', date: '', description: '' });
      fetchProjectDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add cost');
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/documents`, { ...docForm, project_id: projectId, uploaded_by_user_id: user.id }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Document added!');
      setShowDocDialog(false);
      setDocForm({ filename: '', category: 'project-documents', file_path: '' });
      fetchProjectDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add document');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar user={user} logout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <div className="flex-1 p-8"><Skeleton className="h-12 w-64 mb-6" /><Skeleton className="h-96 w-full" /></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" data-testid="project-detail-page">
      <Sidebar user={user} logout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex-1 overflow-auto">
        <div className="bg-[hsl(var(--accent-mist))] border-b border-border">
          <div className="max-w-[1200px] mx-auto px-8 py-6">
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>{project?.name}</h1>
            <p className="text-muted-foreground mt-1">{project?.description || 'No description'}</p>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-8 py-6">
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="tasks" data-testid="tasks-tab">Tasks</TabsTrigger>
              <TabsTrigger value="costs" data-testid="costs-tab">Costs</TabsTrigger>
              <TabsTrigger value="documents" data-testid="documents-tab">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks">
              <Card className="shadow-[var(--shadow-1)]" data-testid="tasks-card">
                <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Tasks</CardTitle><CardDescription>Manage tasks with baseline freeze</CardDescription></div>
                  {user?.role !== 'team_member' && (<Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}><DialogTrigger asChild><Button className="bg-[hsl(var(--brand))] hover:bg-[hsl(188_60%_30%)] text-white" data-testid="create-task-button"><Plus className="mr-2 h-4 w-4" />New Task</Button></DialogTrigger><DialogContent className="max-w-2xl" data-testid="create-task-dialog"><DialogHeader><DialogTitle>Create New Task</DialogTitle><DialogDescription>Add a new task</DialogDescription></DialogHeader><form onSubmit={handleCreateTask} className="space-y-4"><div className="space-y-2"><Label htmlFor="task-name">Task Name *</Label><Input id="task-name" value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })} required data-testid="task-name-input" /></div><div className="space-y-2"><Label htmlFor="task-description">Description</Label><Textarea id="task-description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} rows={3} data-testid="task-description-input" /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Status</Label><Select value={taskForm.status} onValueChange={(value) => setTaskForm({ ...taskForm, status: value })}><SelectTrigger data-testid="task-status-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todo">To Do</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Priority</Label><Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}><SelectTrigger data-testid="task-priority-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setShowTaskDialog(false)}>Cancel</Button><Button type="submit" className="bg-[hsl(var(--brand))] hover:bg-[hsl(188_60%_30%)] text-white" data-testid="submit-task-button">Create Task</Button></DialogFooter></form></DialogContent></Dialog>)}
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (<div className="text-center py-12 text-muted-foreground"><p>No tasks yet.</p></div>) : (<Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Frozen</TableHead>{user?.role !== 'team_member' && <TableHead>Actions</TableHead>}</TableRow></TableHeader><TableBody>{tasks.map((task) => (<TableRow key={task.id} data-testid={`task-row-${task.id}`}><TableCell className="font-medium">{task.name}</TableCell><TableCell><span className={`px-2 py-1 text-xs rounded-full ${task.status === 'completed' ? 'bg-[hsl(var(--success)/.2)] text-[hsl(var(--success))]' : task.status === 'in_progress' ? 'bg-[hsl(var(--chart-1)/.2)] text-[hsl(var(--chart-1))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>{task.status.replace('_', ' ')}</span></TableCell><TableCell><span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'high' ? 'bg-[hsl(var(--danger)/.2)] text-[hsl(var(--danger))]' : task.priority === 'medium' ? 'bg-[hsl(var(--warning)/.2)] text-[hsl(var(--warning))]' : 'bg-[hsl(var(--chart-3)/.2)] text-[hsl(var(--chart-3))]'}`}>{task.priority}</span></TableCell><TableCell>{task.is_frozen ? <Lock className="h-4 w-4 text-[hsl(var(--brand))]" /> : <span className="text-muted-foreground text-sm">No</span>}</TableCell>{user?.role !== 'team_member' && (<TableCell><Button variant="ghost" size="sm" onClick={() => handleFreezeTask(task.id, task.is_frozen)} disabled={task.is_frozen} data-testid={`baseline-freeze-toggle-${task.id}`}>{task.is_frozen ? 'Frozen' : 'Freeze'}</Button></TableCell>)}</TableRow>))}</TableBody></Table>)}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="costs">
              <Card className="shadow-[var(--shadow-1)]" data-testid="costs-card">
                <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Costs</CardTitle><CardDescription>Track expenses</CardDescription></div>
                  {user?.role !== 'team_member' && (<Dialog open={showCostDialog} onOpenChange={setShowCostDialog}><DialogTrigger asChild><Button className="bg-[hsl(var(--brand))] hover:bg-[hsl(188_60%_30%)] text-white" data-testid="add-cost-button"><Plus className="mr-2 h-4 w-4" />Add Cost</Button></DialogTrigger><DialogContent data-testid="add-cost-dialog"><DialogHeader><DialogTitle>Add Cost</DialogTitle><DialogDescription>Record expense</DialogDescription></DialogHeader><form onSubmit={handleCreateCost} className="space-y-4"><div className="space-y-2"><Label htmlFor="cost-category">Category *</Label><Input id="cost-category" value={costForm.category} onChange={(e) => setCostForm({ ...costForm, category: e.target.value })} required placeholder="e.g., Labor" data-testid="cost-category-input" /></div><div className="space-y-2"><Label htmlFor="cost-amount">Amount *</Label><Input id="cost-amount" type="number" step="0.01" value={costForm.amount} onChange={(e) => setCostForm({ ...costForm, amount: e.target.value })} required data-testid="cost-amount-input" /></div><div className="space-y-2"><Label htmlFor="cost-date">Date *</Label><Input id="cost-date" type="date" value={costForm.date} onChange={(e) => setCostForm({ ...costForm, date: e.target.value })} required data-testid="cost-date-input" /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setShowCostDialog(false)}>Cancel</Button><Button type="submit" className="bg-[hsl(var(--brand))] hover:bg-[hsl(188_60%_30%)] text-white" data-testid="submit-cost-button">Add Cost</Button></DialogFooter></form></DialogContent></Dialog>)}
                </CardHeader>
                <CardContent>
                  {costs.length === 0 ? (<div className="text-center py-12 text-muted-foreground"><p>No costs recorded.</p></div>) : (<Table><TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead></TableRow></TableHeader><TableBody>{costs.map((cost) => (<TableRow key={cost.id} data-testid={`cost-row-${cost.id}`}><TableCell className="font-medium">{cost.category}</TableCell><TableCell className="font-mono">${cost.amount.toFixed(2)}</TableCell><TableCell>{new Date(cost.date).toLocaleDateString()}</TableCell></TableRow>))}</TableBody></Table>)}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents">
              <Card className="shadow-[var(--shadow-1)]" data-testid="documents-card">
                <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Documents</CardTitle><CardDescription>Manage files (3 categories)</CardDescription></div>
                  <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}><DialogTrigger asChild><Button className="bg-[hsl(var(--brand))] hover:bg-[hsl(188_60%_30%)] text-white" data-testid="documents-upload-input"><Plus className="mr-2 h-4 w-4" />Add Document</Button></DialogTrigger><DialogContent data-testid="add-document-dialog"><DialogHeader><DialogTitle>Add Document</DialogTitle><DialogDescription>Upload document</DialogDescription></DialogHeader><form onSubmit={handleCreateDocument} className="space-y-4"><div className="space-y-2"><Label htmlFor="doc-filename">Filename *</Label><Input id="doc-filename" value={docForm.filename} onChange={(e) => setDocForm({ ...docForm, filename: e.target.value })} required data-testid="document-filename-input" /></div><div className="space-y-2"><Label>Category</Label><Select value={docForm.category} onValueChange={(value) => setDocForm({ ...docForm, category: value })}><SelectTrigger data-testid="document-category-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="project-documents">Project Documents</SelectItem><SelectItem value="images">Images</SelectItem><SelectItem value="relationships">Relationships</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="doc-path">File Path *</Label><Input id="doc-path" value={docForm.file_path} onChange={(e) => setDocForm({ ...docForm, file_path: e.target.value })} required data-testid="document-path-input" /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setShowDocDialog(false)}>Cancel</Button><Button type="submit" className="bg-[hsl(var(--brand))] hover:bg-[hsl(188_60%_30%)] text-white" data-testid="submit-document-button">Add Document</Button></DialogFooter></form></DialogContent></Dialog>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (<div className="text-center py-12 text-muted-foreground"><p>No documents yet.</p></div>) : (<Table><TableHeader><TableRow><TableHead>Filename</TableHead><TableHead>Category</TableHead><TableHead>Upload Date</TableHead></TableRow></TableHeader><TableBody>{documents.map((doc) => (<TableRow key={doc.id} data-testid={`document-row-${doc.id}`}><TableCell className="font-medium">{doc.filename}</TableCell><TableCell><span className="px-2 py-1 text-xs rounded-full bg-[hsl(var(--accent-mist))] text-[hsl(var(--brand))]">{doc.category.replace('-', ' ')}</span></TableCell><TableCell>{new Date(doc.upload_date).toLocaleDateString()}</TableCell></TableRow>))}</TableBody></Table>)}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}