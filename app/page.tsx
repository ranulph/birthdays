import React from 'react';
import { getPageSession } from '@/components/getPageSession';
import Birthdays from './Birthdays';

export default async function Home() {

  const session = await getPageSession();

  let isLoggedIn;

  if (!session) {
    isLoggedIn = false
  } else {
    isLoggedIn = true
  }

  const userId: string = session?.user.userId ?? ""
  const username: string = session?.user.githubUsername ?? ""
  const email: string = session?.user.email ?? ""
  const sessionId: string = session?.sessionId ?? ""

  return (
    <main className="flex flex-col max-w-lg mx-auto px-2 mt-24">
        <Birthdays userId={userId} username={username} email={email} sessionId={sessionId} isLoggedIn={isLoggedIn} />
    </main>
  )
}
