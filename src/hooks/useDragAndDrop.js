import { useState, useRef } from 'react';

export const useDragAndDrop = (onTaskUpdate) => {
  const [dragging, setDragging] = useState(null);
  const dragRef = useRef(null);

  const handleDragStart = (task, e) => {
    setDragging(task);
    dragRef.current = { startX: e.clientX, originalStart: new Date(task.startDate) };
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!dragging || !dragRef.current) return;

    const diff = e.clientX - dragRef.current.startX;
    const daysDiff = Math.round(diff / 32); // 32px per day
    const newStartDate = new Date(dragRef.current.originalStart);
    newStartDate.setDate(newStartDate.getDate() + daysDiff);

    onTaskUpdate(dragging.id, {
      startDate: newStartDate.toISOString().split('T')[0]
    });
  };

  const handleDragEnd = () => {
    setDragging(null);
    dragRef.current = null;
  };

  return { handleDragStart, handleDragOver, handleDragEnd };
};