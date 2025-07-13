import { APIResponse } from '~/~types/API';

export const MethodNotAllowed = (method: string): APIResponse => ({
  success: false,
  error: `This route does not support ${method.toUpperCase()}`,
});
