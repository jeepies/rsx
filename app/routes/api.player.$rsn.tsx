import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { MethodNotAllowed } from '~/~constants/API';
import { APIResponse } from '~/~types/API';

export async function loader({ params }: LoaderFunctionArgs): Promise<APIResponse> {
  const response: APIResponse = { success: false, error: 'Method not yet implemented' };

  return response;
}

export async function action(): Promise<APIResponse> {
  return MethodNotAllowed('POST');
}
