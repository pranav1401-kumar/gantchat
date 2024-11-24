import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';

export const getTasks = async (userId) => {
  const tasksRef = collection(db, 'tasks');
  const q = query(tasksRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addTask = async (task) => {
  return await addDoc(collection(db, 'tasks'), task);
};

export const updateTask = async (taskId, updates) => {
  const taskRef = doc(db, 'tasks', taskId);
  return await updateDoc(taskRef, updates);
};

export const deleteTask = async (taskId) => {
  const taskRef = doc(db, 'tasks', taskId);
  return await deleteDoc(taskRef);
};