/**
 * Format data to be sent to the client
 */
export const data = {
  success: (message?: any, data?: any, component?: any) => {
    return { success: true, message: message ?? "", data, component };
  },
  error: (message?: any, data?: any, component?: any) => {
    return { success: false, message: message ?? "", data, component };
  }
};