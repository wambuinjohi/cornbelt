/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Contact form request data
 */
export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

/**
 * Contact form response type for /api/contact
 */
export interface ContactResponse {
  success: boolean;
  message: string;
  data?: {
    submittedAt: string;
  };
  error?: string;
}
