import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import GoogleSignIn from './components/auth/GoogleSignIn';
import GanttChart from './components/gantt/GanttChart';
import TaskForm from './components/tasks/TaskForm';
import TaskList from './components/tasks/TaskList';
import { ToastProvider } from './components/common/Toast';
import { exportToCsv, importFromCsv } from './utils/csvUtils';
import { getTasks } from './services/taskService'; // Import the service to fetch tasks

const App = () => {
  const { user } = useAuth();
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [tasks, setTasks] = useState([]); // Add tasks state

  // Fetch tasks when component mounts or user changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (user) {
        try {
          const userTasks = await getTasks(user.uid);
          setTasks(userTasks);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      }
    };

    fetchTasks();
  }, [user]);

  const handleTaskAdded = async () => {
    // Refresh tasks after adding new task
    if (user) {
      try {
        const userTasks = await getTasks(user.uid);
        setTasks(userTasks);
      } catch (error) {
        console.error('Error refreshing tasks:', error);
      }
    }
    setShowNewTaskForm(false);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const importedTasks = await importFromCsv(file);
        // Update tasks state with imported tasks
        setTasks(prevTasks => [...prevTasks, ...importedTasks]);
        // Here you might want to also save the imported tasks to your backend
      } catch (error) {
        console.error('Error importing tasks:', error);
      }
    }
    // Reset file input
    e.target.value = '';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <GoogleSignIn />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Gantt Chart Task Management
            </h1>
            {/* <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNewTaskForm(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                New Task
              </button>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoSchedule}
                  onChange={(e) => setAutoSchedule(e.target.checked)}
                  className="form-checkbox"
                />
                <span>Auto Schedule</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="hidden"
                  id="import-csv"
                />
                <label
                  htmlFor="import-csv"
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
                >
                  Import CSV
                </label>
                <button
                  onClick={() => exportToCsv(tasks)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Export CSV
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {showNewTaskForm && (
          <div className="mb-6">
            <TaskForm onTaskAdded={handleTaskAdded} />
          </div>
        )}
        <div className="space-y-6">
          <GanttChart tasks={tasks} autoSchedule={autoSchedule} />
          <TaskList tasks={tasks} onTasksUpdate={setTasks} />
        </div>
      </main>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  );
};

export default AppWrapper;