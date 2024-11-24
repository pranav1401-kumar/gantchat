import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { getTasks, addTask, updateTask, deleteTask } from '../../services/taskService';
import { Download, Upload, Edit2, Trash2, Plus, Minus, Calendar, ChevronDown } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const GanttChart = () => {
  // States
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [scale, setScale] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoSchedule, setAutoSchedule] = useState(false);
  const fileInputRef = useRef(null);
  const timelineRef = useRef(null);

  // Timeline setup
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(addDays(startDate, 90)); // Show 3 months
  const dates = eachDayOfInterval({ start: startDate, end: endDate });

  // Group dates by month
  const monthGroups = dates.reduce((acc, date) => {
    const monthKey = format(date, 'MMM yyyy');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(date);
    return acc;
  }, {});

  const [newTask, setNewTask] = useState({
    name: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    progress: 0,
    description: '',
    color: '#6366F1'
  });

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (autoSchedule) {
      handleAutoSchedule();
    }
  }, [autoSchedule]);

  const loadTasks = async () => {
    try {
      const loadedTasks = await getTasks('currentUserId');
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleTaskCreate = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedTask) {
        await updateTask(selectedTask.id, newTask);
      } else {
        await addTask({
          ...newTask,
          userId: 'currentUserId',
          createdAt: new Date().toISOString()
        });
      }
      await loadTasks();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleTaskEdit = (task) => {
    setSelectedTask(task);
    setNewTask(task);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        await loadTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedTask(null);
    setNewTask({
      name: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      progress: 0,
      description: '',
      color: '#6366F1'
    });
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target.result;
        const lines = csvText.split('\n');
        
        const importedTasks = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            name: values[0],
            startDate: values[1],
            endDate: values[2],
            progress: parseInt(values[3]),
            color: values[4] || '#6366F1',
            description: values[5] || '',
            userId: 'currentUserId'
          };
        });

        for (const task of importedTasks) {
          await addTask(task);
        }
        await loadTasks();
      } catch (error) {
        console.error('Error importing tasks:', error);
        alert('Error importing tasks. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const headers = ['Name,Start Date,End Date,Progress,Color,Description'];
    const csvContent = tasks.map(task => 
      `${task.name},${task.startDate},${task.endDate},${task.progress},${task.color},${task.description || ''}`
    ).join('\n');

    const blob = new Blob([headers + '\n' + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAutoSchedule = () => {
    if (!autoSchedule || tasks.length === 0) return;

    const sortedTasks = [...tasks].sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    );

    let currentDate = new Date(sortedTasks[0]?.startDate || new Date());
    
    const scheduledTasks = sortedTasks.map(task => {
      const duration = Math.ceil(
        (new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24)
      );

      const newTask = {
        ...task,
        startDate: format(currentDate, 'yyyy-MM-dd'),
        endDate: format(addDays(currentDate, duration), 'yyyy-MM-dd')
      };

      currentDate = addDays(currentDate, duration + 1);
      return newTask;
    });

    setTasks(scheduledTasks);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;

    const dayWidth = 32;
    const dragOffset = Math.round((result.destination.x - result.source.x) / dayWidth);
    
    const newStartDate = addDays(new Date(task.startDate), dragOffset);
    const duration = Math.ceil(
      (new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24)
    );
    
    const newEndDate = addDays(newStartDate, duration);

    try {
      await updateTask(taskId, {
        ...task,
        startDate: format(newStartDate, 'yyyy-MM-dd'),
        endDate: format(newEndDate, 'yyyy-MM-dd')
      });
      await loadTasks();
    } catch (error) {
      console.error('Error updating task position:', error);
    }
  };

  const TimelineHeader = () => (
    <div className="sticky top-0 bg-white z-10">
      <div className="flex border-b">
        {Object.entries(monthGroups).map(([month, days]) => (
          <div
            key={month}
            className="flex-shrink-0 border-r"
            style={{ width: `${days.length * 32}px` }}
          >
            <div className="px-2 py-1 font-medium text-sm border-b">
              {month}
            </div>
            <div className="flex">
              {days.map(date => (
                <div
                  key={date.toISOString()}
                  className={`
                    flex-shrink-0 w-8 text-center text-xs py-1 border-r
                    ${format(date, 'EEEE') === 'Sunday' ? 'bg-gray-50' : ''}
                  `}
                >
                  <div className="font-medium">{format(date, 'd')}</div>
                  <div className="text-gray-500">{format(date, 'EEE')}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TaskBar = ({ task, index }) => {
    const startDay = new Date(task.startDate);
    const duration = Math.ceil(
      (new Date(task.endDate) - startDay) / (1000 * 60 * 60 * 24)
    ) + 1;
    
    const leftPosition = dates.findIndex(date => 
      format(date, 'yyyy-MM-dd') === format(startDay, 'yyyy-MM-dd')
    ) * 32;

    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="flex items-center h-12 hover:bg-gray-50 w-full"
          >
            <div className="flex-shrink-0 w-64 px-4 flex items-center justify-between">
              <span className="truncate">{task.name}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTaskEdit(task)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => handleTaskDelete(task.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex-grow relative min-w-[800px]">
              <div
                className={`
                  absolute h-8 rounded-lg transition-all
                  ${snapshot.isDragging ? 'shadow-lg' : ''}
                `}
                style={{
                  left: `${leftPosition}px`,
                  width: `${duration * 32}px`,
                  backgroundColor: task.color,
                  opacity: snapshot.isDragging ? 0.9 : 0.8,
                  transform: `scale(${scale})`
                }}
              >
                <div
                  className="h-full rounded-lg bg-white bg-opacity-30"
                  style={{ width: `${task.progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                  {task.progress}%
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const filteredTasks = tasks.filter(task => 
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">Project Timeline</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            + New Task
          </button>
          <div className="flex space-x-2">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-3 py-1 border rounded-md hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-3 py-1 border rounded-md hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Auto Schedule</span>
            <button
              className={`w-12 h-6 rounded-full transition-colors ${
                autoSchedule ? 'bg-purple-600' : 'bg-gray-200'
              }`}
              onClick={() => setAutoSchedule(!autoSchedule)}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                  autoSchedule ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md pl-8"
          />
          <svg
            className="w-4 h-4 absolute left-2 top-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Task List */}
          <div className="w-64 flex-shrink-0 border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium mb-2">Tasks</h3>
              <div className="space-y-1">
                {filteredTasks.map(task => (
                  <div
                    key={task.id}className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleTaskEdit(task)}
                  >
                    {task.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-x-auto" ref={timelineRef}>
            <TimelineHeader />
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="timeline" direction="vertical">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="relative"
                    style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}
                  >
                    {filteredTasks.map((task, index) => (
                      <TaskBar 
                        key={task.id} 
                        task={task} 
                        index={index}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="fixed right-4 top-1/2 bg-white shadow-lg rounded-lg -translate-y-1/2">
        <button
          onClick={() => setScale(s => Math.min(s * 1.2, 2))}
          className="block p-2 hover:bg-gray-100 border-b"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale(s => Math.max(s / 1.2, 0.5))}
          className="block p-2 hover:bg-gray-100"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {isEditMode ? 'Edit Task' : 'New Task'}
            </h3>
            <form onSubmit={handleTaskCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newTask.startDate}
                    onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newTask.endDate}
                    onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Progress ({newTask.progress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newTask.progress}
                  onChange={(e) => setNewTask({ ...newTask, progress: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={newTask.color}
                  onChange={(e) => setNewTask({ ...newTask, color: e.target.value })}
                  className="w-full h-10 p-1 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  {isEditMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick View Task Details */}
      {selectedTask && !isModalOpen && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-96">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-medium">{selectedTask.name}</h4>
            <button
              onClick={() => setSelectedTask(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span>{format(new Date(selectedTask.startDate), 'MMM d, yyyy')} - </span>
              <span>{format(new Date(selectedTask.endDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${selectedTask.progress}%`,
                  backgroundColor: selectedTask.color
                }}
              />
            </div>
            <p className="text-gray-600">{selectedTask.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;