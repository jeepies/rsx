import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { PlayerDataFetcher } from '~/~models/data-fetcher.server';

const MANUAL_REFRESH_COOLDOWN_MS = 5 * 60 * 1000;

export async function loader({ params }: LoaderFunctionArgs) {
  const rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) throw new Response('Missing RSN', { status: 400 });

  const fetcher = await PlayerDataFetcher.instance(rsn);
  if (!fetcher) return { refreshInfo: 0 };

  const lastRefresh = await fetcher.getLastRefresh();
  return { refreshInfo: lastRefresh };
}

export async function action({ params }: ActionFunctionArgs) {
  const rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) throw new Response('Missing RSN', { status: 400 });

  const fetcher = await PlayerDataFetcher.instance(rsn);
  if (!fetcher) return { success: false };

  const lastRefresh = await fetcher.getLastRefresh();
  const now = Date.now();

  if (now - lastRefresh < MANUAL_REFRESH_COOLDOWN_MS) {
    return { success: false };
  }

  const data = await fetcher.getFreshestData(true);
  return typeof data === 'string' ? { success: false } : { success: true };
}
