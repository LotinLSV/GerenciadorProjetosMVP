import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { TrendingUp, FolderKanban, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DashboardPage({ user, logout, darkMode, toggleDarkMode }) {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, projectsRes, tasksRes] = await Promise.all([
        axios.get(`${API}/stats/dashboard`, { headers }),
        axios.get(`${API}/projects`, { headers }),
        axios.get(`${API}/tasks`, { headers }),
      ]);

      setStats(statsRes.data);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] transition-shadow" data-testid={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className={`h-5 w-5 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="flex min-h-screen" data-testid="dashboard-page">
      <Sidebar user={user} logout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="flex-1 overflow-auto">
        <div className="bg-[hsl(var(--accent-mist))] border-b border-border">
          <div className="max-w-[1200px] mx-auto px-8 py-6">
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.username}!</p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-8 py-6 space-y-6">
          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Projects"
                value={stats?.total_projects || 0}
                icon={FolderKanban}
                color="text-[hsl(var(--chart-1))]"
              />
              <StatCard
                title="Active Projects"
                value={stats?.active_projects || 0}
                icon={TrendingUp}
                color="text-[hsl(var(--chart-4))]"
              />
              <StatCard
                title="Total Tasks"
                value={stats?.total_tasks || 0}
                icon={Clock}
                color="text-[hsl(var(--chart-3))]"
              />
              <StatCard
                title="Completed Tasks"
                value={stats?.completed_tasks || 0}
                icon={CheckCircle2}
                color="text-[hsl(var(--success))]"
              />
            </div>
          )}

          {/* Recent Projects */}
          <Card className="shadow-[var(--shadow-1)]" data-testid="recent-projects-card">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your latest project activities</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No projects yet. Create one to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                      data-testid={`project-row-${project.id}`}
                    >
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">{project.description || 'No description'}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'active' ? 'bg-[hsl(var(--success)/.2)] text-[hsl(var(--success))]' :
                        project.status === 'completed' ? 'bg-[hsl(var(--chart-3)/.2)] text-[hsl(var(--chart-3))]' :
                        'bg-[hsl(var(--warning)/.2)] text-[hsl(var(--warning))]'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}