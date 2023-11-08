'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { UserToggle } from "./ui/usertoggle";
import { ModeToggle } from "./ui/modetoggle";
import { useAtom } from "jotai";
import { userEmailAtom } from "@/app/Atoms";
import { useEffect } from "react";
import { token } from "@/app/token";
import { redirect } from "next/navigation";
import { useRouter } from 'next/navigation'


const handleEmail = async (userId: string, userEmail: string) => {
    const res = await fetch('/api/saveemail', {
        method: 'POST',
        body: JSON.stringify({ userId: userId, email: userEmail }),
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    }).then(resp => resp.json())
    return res
};

export default function SetEmail({ userId, username, email, isLoggedIn }: { userId: string; username: string; email: string; isLoggedIn: boolean; }) {
    
    const [userEmail, setUserEmail] = useAtom(userEmailAtom);

    const router = useRouter()

    useEffect(() => {
        setUserEmail(email); 
    }, [email]);

    const handleClick = async () => {
        const res = await handleEmail(userId, userEmail);
        if (res) {
            router.push('/')    
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}>
                <div className='flex justify-between items-baseline px-1'>
                    <a href="/">
                        <h1 className="text-4xl font-extrabold tracking-tight pl-2 cursor-pointer">
                            Birthdays
                        </h1>
                    </a>
                    <div className='flex'>
                        <UserToggle username={username} email={email} isLoggedIn={isLoggedIn} />
                        <ModeToggle />
                    </div>
                </div>
                <Card className='mt-3 active:scale-100 w-full h-[345px] hover:cursor-default hover:bg-transparent dark:hover:bg-transparent active:shadow-none'>
                    <CardContent className='flex flex-col h-[345px] items-center text-center'>
                            <div className='md:text-lg text-base text-accent-foreground mt-6 font-medium text-center'>Set Email</div>

                            {!isLoggedIn && <div className="mt-6">Please Sign In.</div>}
                            {isLoggedIn && 
                                <div className="h-full flex flex-col items-center justify-between">
                                    <div className='flex flex-col mt-6'>
                                        <input value={userEmail} onChange={(e) => setUserEmail(e.currentTarget.value)} className='w-64 border-b-2 pl-1 bg-transparent text-base text-center focus-visible:outline-none' />
                                    </div>
                                    <Button onClick={() => handleClick()} variant={"outline"} className="w-[260px] text-center mb-2 h-12 active:scale-95 text-muted-foreground">
                                        Set Email
                                    </Button>
                                </div>
                            }
                    </CardContent>  
                </Card>
        </motion.div>
    )
}