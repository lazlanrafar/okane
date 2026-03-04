/**
 * Shared Axios Instance Entry Point
 *
 * IMPORTANT:
 * - Use 'axiosInstance' from this file for general usage (it defaults to the browser-safe version).
 * - For Server Components or Server Actions, explicitly import from './axios.server'.
 * - For Client Components, 'axiosInstance' is safe to use.
 */

// Default to the client-safe instance to prevent build errors in shared contexts
export { axiosInstance } from "./axios.client";
