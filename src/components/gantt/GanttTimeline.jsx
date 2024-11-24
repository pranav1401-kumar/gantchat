import React from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

const GanttTimeline = () => {
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="flex border-b">
      {days.map(day => (
        <div
          key={day.toISOString()}
          className="flex-shrink-0 w-8 text-center text-sm py-1 border-r"
        >
          {format(day, 'd')}
        </div>
      ))}
    </div>
  );
};

export default GanttTimeline;