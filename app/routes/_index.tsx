import { MetaFunction, redirect } from '@remix-run/react';

export const meta: MetaFunction = () => [
  { title: 'RSX' },
  { name: 'description', content: 'Your comprehensive Runescape 3 tracking and toolkit service' },
  { name: 'viewport', content: 'width=device-width,initial-scale=1' },
  { property: 'og:title', content: 'RSX' },
  {
    property: 'og:description',
    content: 'Your comprehensive Runescape 3 tracking and toolkit service',
  },
  { property: 'og:type', content: 'website' },
  { property: 'og:image', content: 'https://rsx.lol/logo.png' },
  { property: 'og:url', content: 'https://rsx.lol' },
  { name: 'theme-color', content: '#a29bf4' },
];

export async function loader() {
  return redirect('/dashboard/index');
}

export async function action() {
  return redirect('/dashboard/index');
}
