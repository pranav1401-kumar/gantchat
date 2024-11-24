import React from 'react';

const TaskProgress = ({ progress }) => {
  return (
    <div
      className="h-full bg-opacity-30 bg-white rounded-lg"
      style={{ width: `${progress}%` }}
    />
  );
};

export default TaskProgress;