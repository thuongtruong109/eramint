import { useSession, signIn, signOut } from 'next-auth/react';

export default function NftEditor() {
  const { data: session } = useSession();

  const handleGitHubLogin = () => {
    if (session) {
      signOut();
    } else {
      signIn('github');
    }
  };

  // Sử dụng session.accessToken thay cho config.token
  const token = session?.accessToken || '';

  // ...existing code...

  return (
          <button
            onClick={handleGitHubLogin}
            className="w-full p-2 mt-1 rounded-lg border border-slate-150/10 bg-slate-150/5 text-inherit box-border outline-none hover:bg-slate-150/10"
          >
            {session ? 'Logout' : 'Login with GitHub'}
          </button>
  );
}