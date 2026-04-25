'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../components/providers/AuthProvider';
import { apiFetch } from '../../../lib/api';

type UserDto = { id: string; email: string; firstName: string; lastName: string; role: string; createdAt: string };
type LearningActivityDto = { id: string; subject: string; topic: string; gradeLevel: string; language: string; confidenceScore: number; createdAt: string; userId: string };
type ChildDto = { id: string; name: string; gradeLevel: number; preferredLanguage: string; parentId: string };
type AnalyticsDto = { totalUsers: number; totalParents: number; totalChildren: number; totalActivities: number; avgConfidence: number; subjectBreakdown: { subject: string; count: number }[] };

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, tokens, role, isLoading, logout } = useAuth();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [activities, setActivities] = useState<LearningActivityDto[]>([]);
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'PARENT' as const });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!tokens?.accessToken) {
      router.replace('/login');
      return;
    }
    if (role && role !== 'ADMIN') {
      router.replace('/dashboard/parent');
    }
  }, [isLoading, tokens?.accessToken, role, router]);

  useEffect(() => {
    if (!tokens?.accessToken) return;
    
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, activitiesRes, childrenRes, analyticsRes] = await Promise.all([
          apiFetch<{ success: boolean; data: UserDto[] }>('/admin/users', { method: 'GET', token: tokens.accessToken }),
          apiFetch<{ success: boolean; data: LearningActivityDto[] }>('/admin/activities', { method: 'GET', token: tokens.accessToken }),
          apiFetch<{ success: boolean; data: ChildDto[] }>('/admin/children', { method: 'GET', token: tokens.accessToken }),
          apiFetch<{ success: boolean; data: AnalyticsDto }>('/admin/analytics', { method: 'GET', token: tokens.accessToken })
        ]);
        
        if (usersRes.success) setUsers(usersRes.data);
        if (activitiesRes.success) setActivities(activitiesRes.data);
        if (childrenRes.success) setChildren(childrenRes.data);
        if (analyticsRes.success) setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        setError('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [tokens?.accessToken]);

  const parents = users.filter(u => u.role === 'PARENT');
  const students = children;

  const handleCreateUser = async () => {
    if (!tokens?.accessToken) return;
    
    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        token: tokens.accessToken,
        body: newUser
      });
      
      setShowCreateUser(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'PARENT' });
      // Refresh data
      window.location.reload();
    } catch (error) {
      setError('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!tokens?.accessToken) return;
    
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await apiFetch(`/admin/users/${userId}`, {
          method: 'DELETE',
          token: tokens.accessToken
        });
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        setError('Failed to delete user');
      }
    }
  };

  const handleDeleteChild = async (childId: string) => {
    if (!tokens?.accessToken) return;
    
    if (confirm('Are you sure you want to delete this student account? This action cannot be undone.')) {
      try {
        await apiFetch(`/admin/children/${childId}`, {
          method: 'DELETE',
          token: tokens.accessToken
        });
        setChildren(children.filter(c => c.id !== childId));
      } catch (error) {
        setError('Failed to delete student');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome{user?.firstName ? `, ${user.firstName}` : ''}.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/')}>Home</Button>
          <Button variant="outline" onClick={() => router.push('/learn')}>Learn</Button>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Analytics Overview */}
      {analytics && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalParents}</div>
            <div className="text-sm text-gray-600">Parents</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-green-600">{analytics.totalChildren}</div>
            <div className="text-sm text-gray-600">Students</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-purple-600">{analytics.totalActivities}</div>
            <div className="text-sm text-gray-600">Activities</div>
          </div>
        </div>
      )}

      {/* Content Review & Management - Moved to Top */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Review & Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-md font-medium text-gray-900 mb-4">Review Lessons</h3>
            <p className="mt-1 text-gray-600 text-sm">Review and validate AI-generated lessons created by students.</p>
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full" onClick={() => router.push('/learn')}>
                Review Student Lessons
              </Button>
              <div className="text-xs text-gray-500 mt-2">
                Access saved lessons and review content quality
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-md font-medium text-gray-900 mb-4">Lesson Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Lessons Generated</span>
                <span className="text-sm font-medium text-gray-900">{activities.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lessons This Week</span>
                <span className="text-sm font-medium text-gray-900">
                  {activities.filter(a => {
                    const activityDate = new Date(a.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return activityDate >= weekAgo;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">High Confidence Lessons</span>
                <span className="text-sm font-medium text-gray-900">
                  {activities.filter(a => a.confidenceScore > 0.8).length}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-md font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => router.push('/learn')}>
                Create Test Lesson
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.open('/learn', '_blank')}>
                Open Learn Page
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* All Users Management */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
          <Button onClick={() => setShowCreateUser(true)}>Create User</Button>
        </div>
        
        <div className="card">
          {loading ? (
            <div className="text-sm text-gray-600">Loading users...</div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const userChildren = children.filter(c => c.parentId === user.id);
                    const userActivities = activities.filter(a => a.userId === user.id);
                    return (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'PARENT' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userChildren.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userActivities.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" onClick={() => handleDeleteUser(user.id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-600">No users found.</div>
          )}
        </div>
      </div>

      {/* Parent Management */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Parent Details</h2>
          <Button onClick={() => setShowCreateUser(true)}>Create Parent</Button>
        </div>
        
        <div className="card">
          {loading ? (
            <div className="text-sm text-gray-600">Loading parents...</div>
          ) : parents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children Names</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parents.map((parent) => {
                    const parentChildren = children.filter(c => c.parentId === parent.id);
                    return (
                      <tr key={parent.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parent.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {parent.firstName} {parent.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parent.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parentChildren.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parentChildren.length > 0 ? parentChildren.map(c => c.name).join(', ') : 'No children'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(parent.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" onClick={() => handleDeleteUser(parent.id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-600">No parent accounts found.</div>
          )}
        </div>
      </div>

      {/* Student Management */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Student Details</h2>
        </div>
        
        <div className="card">
          {loading ? (
            <div className="text-sm text-gray-600">Loading students...</div>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => {
                    const parent = parents.find(p => p.id === student.parentId);
                    const studentActivities = activities.filter(a => a.userId === student.id);
                    const lastActivity = studentActivities.length > 0 
                      ? new Date(Math.max(...studentActivities.map(a => new Date(a.createdAt).getTime()))).toLocaleDateString()
                      : 'No activities';
                    return (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Grade {student.gradeLevel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.preferredLanguage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parent ? `${parent.firstName} ${parent.lastName}` : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parent ? parent.email : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {studentActivities.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lastActivity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" onClick={() => handleDeleteChild(student.id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-600">No student accounts found.</div>
          )}
        </div>
      </div>

      {/* All Activities */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Learning Activities</h2>
        </div>
        
        <div className="card">
          {loading ? (
            <div className="text-sm text-gray-600">Loading activities...</div>
          ) : activities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => {
                    const student = students.find(s => s.id === activity.userId);
                    const parent = student ? parents.find(p => p.id === student.parentId) : null;
                    return (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {activity.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.topic}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.gradeLevel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.language}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              activity.confidenceScore > 0.8 ? 'bg-green-500' :
                              activity.confidenceScore > 0.6 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></div>
                            {Math.round(activity.confidenceScore * 100)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student ? student.name : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parent ? parent.email : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-600">No activities found.</div>
          )}
        </div>
      </div>

      
      {/* Learning Analytics */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-md font-medium text-gray-900 mb-4">Subject Breakdown</h3>
            {analytics?.subjectBreakdown && analytics.subjectBreakdown.length > 0 ? (
              <div className="space-y-2">
                {analytics.subjectBreakdown.map((subject) => (
                  <div key={subject.subject} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{subject.subject}</span>
                    <span className="text-sm font-medium text-gray-900">{subject.count} activities</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">No activity data available.</div>
            )}
          </div>

          <div className="card">
            <h3 className="text-md font-medium text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Confidence Score</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics ? Math.round(analytics.avgConfidence * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Learning Activities</span>
                <span className="text-sm font-medium text-gray-900">{analytics?.totalActivities || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Students</span>
                <span className="text-sm font-medium text-gray-900">
                  {students.filter(s => activities.some(a => a.userId === s.id)).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Parent Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={handleCreateUser}>Create Account</Button>
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
