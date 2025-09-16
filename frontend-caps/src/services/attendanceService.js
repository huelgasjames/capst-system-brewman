import api from './api';

// Attendance Management Service
export const attendanceService = {
  // Get branch attendance records
  getBranchAttendance: (params = {}) => {
    return api.get('/attendance/branch', { params });
  },

  // Get current user's attendance status
  getMyAttendance: () => {
    return api.get('/attendance/my-attendance');
  },

  // Check in
  checkIn: () => {
    return api.post('/attendance/check-in');
  },

  // Check out
  checkOut: () => {
    return api.post('/attendance/check-out');
  },

  // Get attendance summary
  getAttendanceSummary: (params = {}) => {
    return api.get('/attendance/summary', { params });
  },

  // Get weekly attendance report
  getWeeklyReport: (params = {}) => {
    return api.get('/attendance/weekly-report', { params });
  }
};
