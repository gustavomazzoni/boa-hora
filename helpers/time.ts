// Format seconds into mm:ss
export const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

// Format date object into HH:mm
export const formatTime = (dateString: string) => {
  const d = new Date(dateString);
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h}:${m < 10 ? "0" : ""}${m}`;
};

// Helper to calculate seconds between two ISO date strings
export const getDiffSeconds = (startNew: string, startOld: string) => {
  const newDate = new Date(startNew);
  const oldDate = new Date(startOld);
  return Math.floor((newDate.getTime() - oldDate.getTime()) / 1000);
};

// Helper to calculate minutes between two ISO date strings
export const getDiffMinutes = (startNew: string, startOld: string) => {
  return getDiffSeconds(startNew, startOld) / 60; // minutes
};

// Extract date portion for comparison (YYYY-MM-DD)
export const getDateKey = (dateString: string) => {
  const d = new Date(dateString);
  return d.toISOString().split("T")[0];
};

const isToday = (dateString: string): boolean => {
  const today = new Date();
  return new Date(dateString).toDateString() === today.toDateString();
};

const isYesterday = (dateString: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(dateString).toDateString() === yesterday.toDateString();
};

// Format date for display (DD/MM)
export const formatDate = (dateString: string) => {
  if (isToday(dateString)) return "Hoje";
  if (isYesterday(dateString)) return "Ontem";

  const d = new Date(dateString);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${day < 10 ? "0" : ""}${day}/${month < 10 ? "0" : ""}${month}`;
};
