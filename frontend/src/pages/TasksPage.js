import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Plus, Lock, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TasksPage({ user, logout, darkMode, toggleDarkMode }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_id: '',
    assigned_to_user_id: '',
    assigned_resource_ids: [],
    status: 'todo',
    priority: 'medium',
    start_date: '',
    end_date: '',
    expected_completion_date: '',
    realized_completion_date: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [tasksRes, projectsRes, resourcesRes] = await Promise.all([
        axios.get(`${API}/tasks`, { headers }),
        axios.get(`${API}/projects`, { headers }),
        axios.get(`${API}/resources`, { headers }),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setResources(resourcesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        expected_completion_date: formData.expected_completion_date || null,
        realized_completion_date: formData.realized_completion_date || null,
      };

      if (editingTask) {
        await axios.put(`${API}/tasks/${editingTask.id}`, data, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Task updated!');
      } else {
        await axios.post(`${API}/tasks`, data, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Task created!');
      }

      setShowDialog(false);
      setEditingTask(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description || '',
      project_id: task.project_id,
      assigned_to_user_id: task.assigned_to_user_id || '',
      assigned_resource_ids: task.assigned_resource_ids || [],
      status: task.status,
      priority: task.priority,
      start_date: task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : '',
      end_date: task.end_date ? new Date(task.end_date).toISOString().split('T')[0] : '',
      expected_completion_date: task.expected_completion_date ? new Date(task.expected_completion_date).toISOString().split('T')[0] : '',
      realized_completion_date: task.realized_completion_date ? new Date(task.realized_completion_date).toISOString().split('T')[0] : '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Task deleted!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete task');
    }
  };

  const handleFreezeTask = async (taskId, currentFrozenState) => {
    if (currentFrozenState) return toast.info('Task is already frozen');
    try {
      const token = localStorage.getItem('token');
      const task = tasks.find(t => t.id === taskId);
      await axios.post(`${API}/baselines/task?task_id=${taskId}`, { name: `Baseline - ${new Date().toISOString()}`, snapshot_data: task }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Task baseline frozen!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to freeze task');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      project_id: '',
      assigned_to_user_id: '',
      assigned_resource_ids: [],
      status: 'todo',
      priority: 'medium',
      start_date: '',
      end_date: '',
      expected_completion_date: '',
      realized_completion_date: '',
    });
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown';
  };

  return (
    <div className="flex min-h-screen" data-testid="tasks-page">
      <Sidebar user={user} logout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex-1 overflow-auto">
        <div className="bg-[hsl(var(--accent-mist))] border-b border-border">
          <div className="max-w-[1200px] mx-auto px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Tasks</h1>
              <p className="text-muted-foreground mt-1">Manage all project tasks with resources</p>
            </div>
            {user?.role !== 'team_member' && (
              <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingTask(null); resetForm(); } }}>
                <DialogTrigger asChild>
                  <Button className="bg-[hsl(var(--brand))] hover:bg-[hsl(188_60%_30%)] text-white shadow-[var(--btn-shadow)]" data-testid="create-task-button">
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="task-dialog">
                  <DialogHeader>
                    <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                    <DialogDescription>
                      {editingTask ? 'Update task details' : 'Add a new task with resources and dates'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="name">Task Name *</Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="task-name-input" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} data-testid="task-description-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project">Project *</Label>
                        <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                          <SelectTrigger data-testid="task-project-select"><SelectValue placeholder="Select project" /></SelectTrigger>
                          <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                          <SelectTrigger data-testid="task-status-select"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                          <SelectTrigger data-testid="task-priority-select"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} data-testid="task-start-date-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} data-testid="task-end-date-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expected_completion">Expected Completion Date</Label>
                        <Input id="expected_completion" type="date" value={formData.expected_completion_date} onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })} data-testid="task-expected-date-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="realized_completion">Realized Completion Date</Label>
                        <Input id="realized_completion" type="date" value={formData.realized_completion_date} onChange={(e) => setFormData({ ...formData, realized_completion_date: e.target.value })} data-testid="task-realized-date-input" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => { setShowDialog(false); setEditingTask(null); resetForm(); }}>Cancel</Button>
                      <Button type="submit" className="bg-[hsl(var(--brand))] hover:bg-[hsl(188_60%_30%)] text-white" data-testid="submit-task-button">
                        {editingTask ? 'Update Task' : 'Create Task'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-8 py-6">
          <Card className="shadow-[var(--shadow-1)]" data-testid="tasks-table-card">
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>View and manage tasks across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No tasks yet</p>
                  <p className="text-sm">Create your first task to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Realized</TableHead>
                      <TableHead>Frozen</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id} data-testid={`task-row-${task.id}`}>
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>{getProjectName(task.project_id)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'completed' ? 'bg-[hsl(var(--success)/.2)] text-[hsl(var(--success))]' : task.status === 'in_progress' ? 'bg-[hsl(var(--chart-1)/.2)] text-[hsl(var(--chart-1))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'high' ? 'bg-[hsl(var(--danger)/.2)] text-[hsl(var(--danger))]' : task.priority === 'medium' ? 'bg-[hsl(var(--warning)/.2)] text-[hsl(var(--warning))]' : 'bg-[hsl(var(--chart-3)/.2)] text-[hsl(var(--chart-3))]'}`}>
                            {task.priority}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{task.expected_completion_date ? new Date(task.expected_completion_date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="text-sm">{task.realized_completion_date ? new Date(task.realized_completion_date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{task.is_frozen ? <Lock className="h-4 w-4 text-[hsl(var(--brand))]" /> : <span className="text-muted-foreground text-sm">No</span>}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {user?.role !== 'team_member' && !task.is_frozen && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(task)} data-testid={`edit-task-${task.id}-button`}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleFreezeTask(task.id, task.is_frozen)} data-testid={`freeze-task-${task.id}-button`}>
                                  <Lock className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)} data-testid={`delete-task-${task.id}-button`}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
