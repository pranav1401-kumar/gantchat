import React, { useState } from 'react';
import { updateTask, deleteTask } from '../../services/taskService';

const TaskItem = ({ task, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const handleUpdate = async () => {
    try {
      await updateTask(task.id, editedTask);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <input
          type="text"
          value={editedTask.name}
          onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{task.name}</h3>
          <div className="text-sm text-gray-500">
            Progress: {task.progress}% | Priority: {task.priority}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;