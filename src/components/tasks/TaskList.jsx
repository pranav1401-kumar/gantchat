import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import { useAuth } from '../auth/AuthContext';
import { getTasks } from '../../services/taskService';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const userTasks = await getTasks(user.uid);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onUpdate={loadTasks}
        />
      ))}
    </div>
  );
};

export default TaskList;