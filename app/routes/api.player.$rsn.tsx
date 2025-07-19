import { cli } from '@remix-run/dev';
import { LoaderFunctionArgs } from '@remix-run/node';
import { MethodNotAllowed } from '~/~constants/API';
import { PlayerDataFetcher } from '~/~models/data-fetcher.server';
import { Runescape } from '~/~services/runescape.server';
import { APIResponse } from '~/~types/API';

export async function loader({ params }: LoaderFunctionArgs): Promise<APIResponse> {
  const response: APIResponse = { success: false, error: 'Unexpected server error' };
  let rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) rsn = 'Kelcei';

  const exists = await Runescape.checkExistence([rsn]);
  console.log(exists);
  if (!exists?.get(rsn)) {
    response.error = 'This user does not exist';
    return response;
  }

  try {
    const client = await PlayerDataFetcher.instance(rsn);
    if (!client) {
      response.error = 'An internal server error occured. Please try again';
      return response;
    }
    const data = await client?.getFreshestData();

    return { success: true, data: data };
  } catch {
    response.error = 'An internal server error occured. Please try again';
    return response;
  }
}

export async function action(): Promise<APIResponse> {
  return MethodNotAllowed('POST');
}
