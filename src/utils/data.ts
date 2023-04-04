/**
 * Format data to be sent to the client
 * @param success If the request is successful
 * @param message Request message
 * @param data Request data
 * @param component Additional data
 * @returns object
 */
export function data(success: boolean, message: string, data?: any, component?: any) {
  return {
    success, message,
    component, data
  }
}