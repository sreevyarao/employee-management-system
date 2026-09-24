/**
 * Shared API response helper format: { success, message, data }
 */
export const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};
