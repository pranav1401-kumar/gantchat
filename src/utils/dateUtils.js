import { format, addDays, differenceInDays } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd');
};

export const calculateDuration = (startDate, endDate) => {
  return differenceInDays(new Date(endDate), new Date(startDate)) + 1;
};

export const adjustDependentTasks = (tasks) => {
  const taskMap = new Map(tasks.map(task => [task.id, task]));
  const adjusted = new Map();

  const adjustTask = (taskId) => {
    if (adjusted.has(taskId)) return adjusted.get(taskId);

    const task = taskMap.get(taskId);
    if (!task.dependencies || task.dependencies.length === 0) {
      adjusted.set(taskId, task);
      return task;
    }

    let maxEndDate = new Date(0);
    for (const depId of task.dependencies) {
      const depTask = adjustTask(depId);
      const depEndDate = new Date(depTask.endDate);
      if (depEndDate > maxEndDate) {
        maxEndDate = depEndDate;
      }
    }

    const duration = calculateDuration(task.startDate, task.endDate);
    const newStartDate = addDays(maxEndDate, 1);
    const newEndDate = addDays(newStartDate, duration - 1);

    const adjustedTask = {
      ...task,
      startDate: formatDate(newStartDate),
      endDate: formatDate(newEndDate)
    };

    adjusted.set(taskId, adjustedTask);
    return adjustedTask;
  };

  tasks.forEach(task => adjustTask(task.id));
  return Array.from(adjusted.values());
};