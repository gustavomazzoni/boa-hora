// Format seconds into mm:ss
export const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

// Format date object into HH:mm
export const formatTime = (dateString) => {
  const d = new Date(dateString);
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h}:${m < 10 ? "0" : ""}${m}`;
};

// Helper to calculate minutes between two ISO date strings
export const getDiffMinutes = (startNew, startOld) => {
  const d1 = new Date(startNew);
  const d2 = new Date(startOld);
  return (d1 - d2) / 1000 / 60; // minutes
};

// Extract date portion for comparison (YYYY-MM-DD)
export const getDateKey = (dateString) => {
  const d = new Date(dateString);
  return d.toISOString().split("T")[0];
};

// Format date for display (DD/MM)
export const formatDate = (dateString) => {
  const d = new Date(dateString);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${day < 10 ? "0" : ""}${day}/${month < 10 ? "0" : ""}${month}`;
};
