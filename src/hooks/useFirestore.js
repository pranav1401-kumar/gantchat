import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  DocumentReference,
  QuerySnapshot
} from 'firebase/firestore';

/**
 * Retrieves all tasks for a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of task objects
 */
export const getTasks = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      orderBy('startDate', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to fetch tasks. Please try again later.');
  }
};

/**
 * Adds a new task to the database
 * @param {Object} task - The task object to add
 * @returns {Promise<DocumentReference>} Reference to the created document
 */
export const addTask = async (task) => {
  if (!task || !task.userId) {
    throw new Error('Task and user ID are required');
  }

  try {
    return await addDoc(collection(db, 'tasks'), {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding task:', error);
    throw new Error('Failed to add task. Please try again later.');
  }
};

/**
 * Updates an existing task
 * @param {string} taskId - The ID of the task to update
 * @param {Object} updates - The updates to apply to the task
 * @returns {Promise<void>}
 */
export const updateTask = async (taskId, updates) => {
  if (!taskId || !updates) {
    throw new Error('Task ID and updates are required');
  }

  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error('Failed to update task. Please try again later.');
  }
};

/**
 * Deletes a task from the database
 * @param {string} taskId - The ID of the task to delete
 * @returns {Promise<void>}
 */
export const deleteTask = async (taskId) => {
  if (!taskId) {
    throw new Error('Task ID is required');
  }

  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task. Please try again later.');
  }
};

/**
 * Imports multiple tasks from CSV data
 * @param {Array} tasks - Array of task objects to import
 * @param {string} userId - The ID of the user importing the tasks
 * @returns {Promise<void>}
 */
export const importTasksFromCSV = async (tasks, userId) => {
  if (!Array.isArray(tasks) || !userId) {
    throw new Error('Valid tasks array and user ID are required');
  }

  try {
    const batch = tasks.map(task => 
      addTask({
        ...task,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    );
    
    await Promise.all(batch);
  } catch (error) {
    console.error('Error importing tasks:', error);
    throw new Error('Failed to import tasks. Please try again later.');
  }
};

/**
 * Validates a task object
 * @param {Object} task - The task object to validate
 * @returns {boolean} True if valid, throws error if invalid
 */
export const validateTask = (task) => {
  if (!task) throw new Error('Task is required');
  if (!task.name) throw new Error('Task name is required');
  if (!task.startDate) throw new Error('Start date is required');
  if (!task.endDate) throw new Error('End date is required');
  if (!task.userId) throw new Error('User ID is required');
  
  const startDate = new Date(task.startDate);
  const endDate = new Date(task.endDate);
  
  if (isNaN(startDate.getTime())) throw new Error('Invalid start date');
  if (isNaN(endDate.getTime())) throw new Error('Invalid end date');
  if (endDate < startDate) throw new Error('End date must be after start date');
  
  return true;
};