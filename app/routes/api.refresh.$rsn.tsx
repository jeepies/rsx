import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { getFreshestData } from '~/services/model/player.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) throw new Response('Missing RSN', { status: 400 });
  await updatePlayer(rsn);
  return { success: 'idk' };
}

export async function action({ params }: ActionFunctionArgs) {
  const rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) throw new Response('Missing RSN', { status: 400 });
  updatePlayer(rsn);
  return { success: 'idk' };
}

export async function updatePlayer(rsn: string) {
  try {
    const data = await getFreshestData(rsn);
  } catch (error) {
    console.error('Error updating player:', error);
    throw new Response('Failed to update player data', { status: 500 });
  }
}
