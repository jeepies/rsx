import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { getFreshestData } from '~/~models/player.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) throw new Response('Missing RSN', { status: 400 });
  const data = await getFreshestData(rsn);
  if (typeof data === 'string') return { success: false };
  return { success: true };
}

export async function action({ params }: ActionFunctionArgs) {
  const rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) throw new Response('Missing RSN', { status: 400 });
  const data = await getFreshestData(rsn);
  if (typeof data === 'string') return { success: false };
  return { success: true };
}
