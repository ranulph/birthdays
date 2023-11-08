"use client"

import * as React from "react";
import { PersonIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserToggle({ username, email, isLoggedIn }: { username: string; email: string; isLoggedIn: boolean }) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={!isLoggedIn || email === '' ? "border border-red-900/70" : ""}>
          <PersonIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Sign In</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">

        {isLoggedIn ? 
          <div className="h-32 w-48">
            <DropdownMenuItem className='flex flex-col items-center justify-center h-1/2'>
              <div className="text-neutral-500 dark:text-white/30">Signed in as {username}</div>
              <div className="text-neutral-500 dark:text-white/30 mt-2">{email}</div>
            </DropdownMenuItem>
            <div className="flex h-1/2 w-full justify-around">
              <a href="/setemail">
                <DropdownMenuItem className='flex w-24 h-full items-center cursor-pointer'>
                  <div className="font-medium flex justify-center w-full text-center items-center">Set Email</div>
                </DropdownMenuItem>
              </a>
              <a href="/logout">
                <DropdownMenuItem className='flex w-24 h-full items-center cursor-pointer'>
                  <div className="font-medium flex justify-center w-full text-center items-center">Logout</div>
                </DropdownMenuItem>
              </a>
            </div>
          </div>
        : 
          <a href="/login/github">
            <DropdownMenuItem className='p-12 max-h-48 max-w-48 cursor-pointer'>
              Sign-in with Github
            </DropdownMenuItem>
          </a>
        }

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
