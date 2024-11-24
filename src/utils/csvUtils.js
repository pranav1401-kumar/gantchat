import { parse, unparse } from 'papaparse';

export const exportToCsv = (tasks) => {
  const csv = unparse(tasks);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'tasks.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importFromCsv = (file) => {
  return new Promise((resolve, reject) => {
    parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};