import { redirect } from '@remix-run/react';

export async function loader() {
  return redirect('/dashboard/index');
}

export async function action() {
  return redirect('/dashboard/index');
}
