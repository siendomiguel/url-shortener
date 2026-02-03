import Link from 'next/link';
import { Button } from './ui/button';
import { createClient } from '@/lib/supabase/server';
import { UserMenu } from './user-menu';

export async function AuthButton() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  return user ? (
    <UserMenu email={user.email!} />
  ) : (
    <div className="flex gap-2">
      <Button
        asChild
        size="sm"
        variant={'outline'}
        className="rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2 h-10">
        <Link href="/auth/login">Login</Link>
      </Button>
      <Button
        asChild
        size="sm"
        variant={'default'}
        className="rounded-full bg-gray-400 hover:bg-gray-500 dark:bg-gray-400 dark:hover:bg-gray-500 text-gray-100 px-6 py-2 h-10">
        <Link href="/auth/sign-up">Register</Link>
      </Button>
    </div>
  );
}
