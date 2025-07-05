// import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
// import { getFreshestData } from '~/services/model/player.server';

// export async function loader({ params }: LoaderFunctionArgs) {
//   const rsn = params.rsn?.toLowerCase().trim();
//   if (!rsn) throw new Response('Missing RSN', { status: 400 });
//   await getFreshestData(rsn);
//   return { success: 'idk' };
// }

// export async function action({ params }: ActionFunctionArgs) {
//   const rsn = params.rsn?.toLowerCase().trim();
//   if (!rsn) throw new Response('Missing RSN', { status: 400 });
//   getFreshestData(rsn);
//   return { success: 'idk' };
// }