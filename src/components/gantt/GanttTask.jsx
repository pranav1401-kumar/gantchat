import React from 'react';
import { format, differenceInDays,startOfMonth  } from 'date-fns';
import TaskProgress from './TaskProgress';

const GanttTask = ({ task, onUpdate }) => {
  const startDate = new Date(task.startDate);
  const endDate = new Date(task.endDate);
  const duration = differenceInDays(endDate, startDate) + 1;

  const taskStyle = {
    width: `${duration * 32}px`,
    backgroundColor: task.color || '#4299E1',
    marginLeft: `${differenceInDays(startDate, startOfMonth(new Date())) * 32}px`,
  };

  return (
    <div className="flex items-center h-12 border-b">
      <div className="flex-shrink-0 w-48 px-4">{task.name}</div>
      <div className="flex-grow relative">
        <div
          className="absolute h-8 rounded-lg"
          style={taskStyle}
        >
          <TaskProgress progress={task.progress} />
        </div>
      </div>
    </div>
  );
};

export default GanttTask;