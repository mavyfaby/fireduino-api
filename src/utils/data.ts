/**
 * Format data to be sent to the client
 */
export const data = {
  success: (message?: string, data?: any, component?: any) => {
    return { success: true, message: message ?? "", data, component };
  },
  error: (message?: string, data?: any, component?: any) => {
    return { success: false, message: message ?? "", data, component };
  }
};