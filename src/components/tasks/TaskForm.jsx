import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { addTask } from '../../services/taskService';

const TaskForm = ({ onTaskAdded }) => {
  const { user } = useAuth();
  const [task, setTask] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    progress: 0,
    priority: 'LOW',
    color: '#EE00FF',
    status: 'TO-DO'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTask({
        ...task,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      onTaskAdded();
      setTask({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        progress: 0,
        priority: 'LOW',
        color: '#EE00FF',
        status: 'TO-DO'
      });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Task Name</label>
          <input
            type="text"
            value={task.name}
            onChange={(e) => setTask({ ...task, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={task.status}
            onChange={(e) => setTask({ ...task, status: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="TO-DO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={task.startDate}
            onChange={(e) => setTask({ ...task, startDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={task.endDate}
            onChange={(e) => setTask({ ...task, endDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Progress (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={task.progress}
            onChange={(e) => setTask({ ...task, progress: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select
            value={task.priority}
            onChange={(e) => setTask({ ...task, priority: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <input
            type="color"
            value={task.color}
            onChange={(e) => setTask({ ...task, color: e.target.value })}
            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Task
        </button>
      </div>
    </form>
  );
};

export default TaskForm;