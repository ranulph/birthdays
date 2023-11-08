import React from 'react';
import { getPageSession } from '@/components/getPageSession';
import SetEmail from '@/components/SetEmail';

export default async function SetEmailPage() {

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

    return(
        <div className="flex flex-col max-w-lg mx-auto px-2 mt-24">
            <SetEmail userId={userId} username={username} email={email} isLoggedIn={isLoggedIn} />
        </div>
    )
}