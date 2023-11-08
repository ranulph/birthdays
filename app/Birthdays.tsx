'use client'

import React, { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { UserToggle } from '@/components/ui/usertoggle';
import { ModeToggle } from '@/components/ui/modetoggle';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PlusIcon } from '@radix-ui/react-icons';
import BirthdayEntry from '@/components/BirthdayEntry';
import { CalendarIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Birthday, BirthdaySchema } from "@/app/types";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

import { birthdaysAtom, sortBirthdaysAtom } from '@/app/Atoms';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";


const API_URL = 'https://api.birthdays.run';

const getBirthdays = async (sessionId: string) => {
    const response: { birthdays: Birthday[] } = await fetch(API_URL, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + sessionId,
        }
    }).then(resp => resp.json())
    return response
};

const saveBirthday = async (birthday: Birthday, sessionId: string) => {
    await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionId,
        },
        body: JSON.stringify(birthday),
    });
};

export default function Birthdays({ userId, username, email, sessionId, isLoggedIn }: { userId: string; username: string; email: string; sessionId: string; isLoggedIn: boolean; }) {

    const { data } = useSWR(sessionId, getBirthdays);  

    const [birthdays, setBirthdays] = useAtom(birthdaysAtom);
    const sortBirthdays = useSetAtom(sortBirthdaysAtom);

    useEffect(() => {
        if (data) {
            setBirthdays(data.birthdays);
        }
    }, [data])
    
    let birthdaysList: JSX.Element[] = [];
    birthdays.forEach(birthday => {
        birthdaysList.push(<BirthdayEntry key={birthday.id} birthdayObj={birthday} sessionId={sessionId} />)
    });

    const form = useForm<Birthday>({
        resolver: zodResolver(BirthdaySchema),
        defaultValues: {
            id: 'defaultId',
            userId: userId,
            month: undefined,
            day: undefined,
            nextBirthday: undefined,
            name: "",
            lastName: "",
            onDay: true,
            dayBefore: false,
            oneWeekBefore: false,
            twoWeeksBefore: false
        },
    });

    const onSubmit = (birthday: Birthday) => {
        let birthdayWithId = { ...birthday, id: Math.random().toString(36).slice(-5) };
        saveBirthday(birthdayWithId, sessionId);
        setBirthdays([...birthdays, birthdayWithId]);
        sortBirthdays()
        form.reset();
    };

    const formReset = () => {
        form.reset()
    };


    const shortMonths = [1, 3, 5, 8, 10];

    let month = 0;
    if (form.getFieldState("month").isDirty) {
        month = form.getValues().month;
    }
    let day = 0;
    if (form.getFieldState("day").isDirty) {
        day = form.getValues().day;
    }

    if (form.getFieldState("month").isDirty && form.getFieldState("day").isDirty) {
        let nextB = new Date(new Date().getFullYear(), month, day, 12, 30);
        let nextBUnix = Date.parse(nextB.toString());
        let currentTUnix = Date.parse(new Date().toString());
        if (nextBUnix < currentTUnix) {
            nextB.setFullYear(nextB.getFullYear() + 1);
            nextBUnix = Date.parse(nextB.toString());
        }
        form.setValue("nextBirthday", nextBUnix);
    }

    return (
        <>  
            <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 0 }}
                className='flex justify-between items-baseline px-1'>
                    <h1 className="text-4xl font-extrabold tracking-tight pl-2 cursor-default">
                        Birthdays
                    </h1>
                    <div className='flex'>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <PlusIcon className="h-[1.2rem] w-[1.2rem]" />
                                    <span className="sr-only">Add Birthday</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <div className='flex flex-col justify-center text-center'>
                                    <div className='mt-2 mb-3 md:text-lg text-base text-accent-foreground font-medium text-center'>Add Birthday</div>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                                <div className='flex justify-center gap-x-2'>
                                                    <FormField control={form.control} name="month" render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <div className='flex justify-center mt-2'>
                                                                    <div className='flex items-center'>
                                                                        <Popover key={field.value}>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    onClick={() => form.resetField("day")}
                                                                                    variant={"outline"}
                                                                                    className={cn(
                                                                                        "md:w-[200px] w-[160px] justify-center text-center h-12 active:scale-95",
                                                                                        !field.value && "text-muted-foreground"
                                                                                    )}
                                                                                    >
                                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                                    {typeof field.value === 'number' ? format(new Date(2023, field.value), 'LLLL') : <span>Select Month</span>}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="md:w-[200px] w-[160px] px-0 py-1 flex flex-col rounded-xl justify-center" align="start">
                                                                                <Button onClick={() => field.onChange(0)} variant={"month"} value="January">January</Button>
                                                                                <Button onClick={() => field.onChange(1)} variant={"month"} value="February">February</Button>
                                                                                <Button onClick={() => field.onChange(2)} variant={"month"} value="March">March</Button>
                                                                                <Button onClick={() => field.onChange(3)} variant={"month"} value="April">April</Button>
                                                                                <Button onClick={() => field.onChange(4)} variant={"month"} value="May">May</Button>
                                                                                <Button onClick={() => field.onChange(5)} variant={"month"} value="June">June</Button>
                                                                                <Button onClick={() => field.onChange(6)} variant={"month"} value="July">July</Button>
                                                                                <Button onClick={() => field.onChange(7)} variant={"month"} value="August">August</Button>
                                                                                <Button onClick={() => field.onChange(8)} variant={"month"} value="September">September</Button>
                                                                                <Button onClick={() => field.onChange(9)} variant={"month"} value="October">October</Button>
                                                                                <Button onClick={() => field.onChange(10)} variant={"month"} value="November">November</Button>
                                                                                <Button onClick={() => field.onChange(11)} variant={"month"} value="December">December</Button>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </div>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}/>
                                                    <FormField control={form.control} name="day" render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <div className='flex justify-center mt-2'>
                                                                    <div className='flex items-center'>
                                                                        <Popover key={field.value}>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    variant={"outline"}
                                                                                    onClick={() => form.trigger("month")}
                                                                                    disabled={form.getValues().month === undefined}
                                                                                    className={cn(
                                                                                        "md:w-[200px] w-[160px] justify-center text-center h-12 active:scale-95",
                                                                                        !field.value && "text-muted-foreground"
                                                                                    )}
                                                                                    >
                                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                                    {field.value ? format(new Date(2023, 0, field.value), 'do') : <span>Select Day</span>}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="md:w-[200px] w-[160px] px-0 py-1 flex flex-wrap justify-center rounded-xl" align="start">
                                                                                <Button onClick={() => field.onChange(1)} variant={"day"} value="1">1</Button>
                                                                                <Button onClick={() => field.onChange(2)} variant={"day"} value="2">2</Button>
                                                                                <Button onClick={() => field.onChange(3)} variant={"day"} value="3">3</Button>
                                                                                <Button onClick={() => field.onChange(4)} variant={"day"} value="4">4</Button>
                                                                                <Button onClick={() => field.onChange(5)} variant={"day"} value="5">5</Button>
                                                                                <Button onClick={() => field.onChange(6)} variant={"day"} value="6">6</Button>
                                                                                <Button onClick={() => field.onChange(7)} variant={"day"} value="7">7</Button>
                                                                                <Button onClick={() => field.onChange(8)} variant={"day"} value="8">8</Button>
                                                                                <Button onClick={() => field.onChange(9)} variant={"day"} value="9">9</Button>
                                                                                <Button onClick={() => field.onChange(10)} variant={"day"} value="10">10</Button>
                                                                                <Button onClick={() => field.onChange(11)} variant={"day"} value="11">11</Button>
                                                                                <Button onClick={() => field.onChange(12)} variant={"day"} value="12">12</Button>
                                                                                <Button onClick={() => field.onChange(13)} variant={"day"} value="13">13</Button>
                                                                                <Button onClick={() => field.onChange(14)} variant={"day"} value="14">14</Button>
                                                                                <Button onClick={() => field.onChange(15)} variant={"day"} value="15">15</Button>
                                                                                <Button onClick={() => field.onChange(16)} variant={"day"} value="16">16</Button>
                                                                                <Button onClick={() => field.onChange(17)} variant={"day"} value="17">17</Button>
                                                                                <Button onClick={() => field.onChange(18)} variant={"day"} value="18">18</Button>
                                                                                <Button onClick={() => field.onChange(19)} variant={"day"} value="19">19</Button>
                                                                                <Button onClick={() => field.onChange(20)} variant={"day"} value="20">20</Button>
                                                                                <Button onClick={() => field.onChange(21)} variant={"day"} value="21">21</Button>
                                                                                <Button onClick={() => field.onChange(22)} variant={"day"} value="22">22</Button>
                                                                                <Button onClick={() => field.onChange(23)} variant={"day"} value="23">23</Button>
                                                                                <Button onClick={() => field.onChange(24)} variant={"day"} value="24">24</Button>
                                                                                <Button onClick={() => field.onChange(25)} variant={"day"} value="25">25</Button>
                                                                                <Button onClick={() => field.onChange(26)} variant={"day"} value="26">26</Button>
                                                                                <Button onClick={() => field.onChange(27)} variant={"day"} value="27">27</Button>
                                                                                <Button onClick={() => field.onChange(28)} variant={"day"} value="28">28</Button>
                                                                                <Button onClick={() => field.onChange(29)} disabled={form.getValues().month === 1} variant={"day"} value="29">29</Button>
                                                                                <Button onClick={() => field.onChange(30)} disabled={form.getValues().month === 1} variant={"day"} value="30">30</Button>
                                                                                <Button onClick={() => field.onChange(31)} disabled={shortMonths.includes(form.getValues().month)} variant={"day"} value="31">31</Button>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </div>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}/>
                                                </div>
                                                <div className='flex justify-center'>
                                                    <div className='flex flex-col mr-14'>
                                                            <FormField control={form.control} name="name" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <div className="w-full flex justify-end items-center text-lg md:text-xl mt-4 mx-1 h-12">
                                                                            <div className="mr-2 md:text-lg text-base text-muted-foreground font-medium">
                                                                                Name
                                                                            </div>
                                                                            <input disabled={!form.getValues().day} value={field.value} onChange={field.onChange} id='name' className='w-32 border-b-2 bg-transparent focus-visible:outline-none' />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name="lastName" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <div className="w-full flex justify-end items-center text-lg md:text-xl mx-1 h-12">
                                                                            <div className="mr-2 md:text-lg text-base text-muted-foreground font-medium">
                                                                                Last Name
                                                                            </div>
                                                                            <input disabled={!form.getValues().day} value={field.value} onChange={field.onChange} id='lastname' className='w-32 border-b-2 bg-transparent focus-visible:outline-none' />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}/>
                                                    </div>
                                                </div>
                                                <div className='flex justify-center mt-6 md:text-lg text-base text-muted-foreground font-medium'>Email Reminders</div>
                                                <div className="flex md:gap-8 gap-4 my-4 justify-center">
                                                    <div className='flex flex-col gap-4'>
                                                        <FormField control={form.control} name="onDay" render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className='flex w-fit items-center justify-start'>
                                                                        <Switch id="onDay" checked={field.value} onCheckedChange={field.onChange} />
                                                                        <label htmlFor="onDay" className="text-muted-foreground ml-2 text-sm min-[375px]:text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                            On Day
                                                                        </label>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}/>
                                                        <FormField control={form.control} name="dayBefore" render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className='flex w-fit items-center justify-start'>
                                                                        <Switch id="dayBefore" checked={field.value} onCheckedChange={field.onChange} />
                                                                        <label htmlFor="dayBefore" className="text-muted-foreground ml-2 text-sm min-[375px]:text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                            Day Before
                                                                        </label>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}/>
                                                    </div>
                                                    <div className='flex flex-col gap-4'>
                                                        <FormField control={form.control} name="oneWeekBefore" render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className='flex w-fit items-center justify-start'>
                                                                        <Switch id="oneWeekBefore" checked={field.value} onCheckedChange={field.onChange} />
                                                                        <label htmlFor="oneWeekBefore" className="text-muted-foreground ml-2 text-sm min-[375px]:text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                            1 Week Before
                                                                        </label>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}/>
                                                        <FormField control={form.control} name="twoWeeksBefore" render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className='flex w-fit items-center justify-start'>
                                                                        <Switch id="twoWeeksBefore" checked={field.value} onCheckedChange={field.onChange} />
                                                                        <label htmlFor="twoWeeksBefore" className="text-muted-foreground ml-2 text-sm min-[375px]:text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                            2 Weeks Before
                                                                        </label>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}/>
                                                    </div>
                                                </div>
                                                <div className='flex justify-end mt-8'>
                                                    <DialogClose disabled={!form.formState.isValid} asChild>
                                                        <Button type="submit" variant='outline' className='active:scale-95 md:text-lg text-base text-muted-foreground font-medium h-10 w-[130px]'>
                                                            Add
                                                        </Button>
                                                    </DialogClose>
                                                </div>
                                            </form>
                                        </Form>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <UserToggle username={username} email={email} isLoggedIn={isLoggedIn} />
                        <ModeToggle />
                    </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 0 }} 
                className='mt-1 px-1 [perspective:1500px]'>

                    {!isLoggedIn && <div className='flex justify-center mt-10'>Please sign in.</div>}
                    {isLoggedIn && email === '' && <div className='flex justify-center mt-10'>Please add an email.</div>}
                    {isLoggedIn && birthdaysList}

                    <div className='flex justify-center my-16'>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button disabled={!isLoggedIn} onClick={() => formReset()} variant='ghost2'>
                                    <PlusIcon className='text-muted-foreground h-[1.2rem] w-[1.2rem] mr-1'/>
                                    Add Birthday
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <div className='flex flex-col justify-center text-center'>
                                    <div className='mt-2 mb-3 md:text-lg text-base text-accent-foreground font-medium text-center'>Add Birthday</div>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                                <div className='flex justify-center gap-x-2'>
                                                    <FormField control={form.control} name="month" render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <div className='flex justify-center mt-2'>
                                                                    <div className='flex items-center'>
                                                                        <Popover key={field.value}>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    onClick={() => form.resetField("day")}
                                                                                    variant={"outline"}
                                                                                    className={cn(
                                                                                        "md:w-[200px] w-[160px] justify-center text-center h-12 active:scale-95",
                                                                                        !field.value && "text-muted-foreground"
                                                                                    )}
                                                                                    >
                                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                                    {typeof field.value === 'number' ? format(new Date(2023, field.value), 'LLLL') : <span>Select Month</span>}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="md:w-[200px] w-[160px] px-0 py-1 flex flex-col rounded-xl justify-center" align="start">
                                                                                <Button onClick={() => field.onChange(0)} variant={"month"} value="January">January</Button>
                                                                                <Button onClick={() => field.onChange(1)} variant={"month"} value="February">February</Button>
                                                                                <Button onClick={() => field.onChange(2)} variant={"month"} value="March">March</Button>
                                                                                <Button onClick={() => field.onChange(3)} variant={"month"} value="April">April</Button>
                                                                                <Button onClick={() => field.onChange(4)} variant={"month"} value="May">May</Button>
                                                                                <Button onClick={() => field.onChange(5)} variant={"month"} value="June">June</Button>
                                                                                <Button onClick={() => field.onChange(6)} variant={"month"} value="July">July</Button>
                                                                                <Button onClick={() => field.onChange(7)} variant={"month"} value="August">August</Button>
                                                                                <Button onClick={() => field.onChange(8)} variant={"month"} value="September">September</Button>
                                                                                <Button onClick={() => field.onChange(9)} variant={"month"} value="October">October</Button>
                                                                                <Button onClick={() => field.onChange(10)} variant={"month"} value="November">November</Button>
                                                                                <Button onClick={() => field.onChange(11)} variant={"month"} value="December">December</Button>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </div>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}/>
                                                    <FormField control={form.control} name="day" render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <div className='flex justify-center mt-2'>
                                                                    <div className='flex items-center'>
                                                                        <Popover key={field.value}>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    variant={"outline"}
                                                                                    onClick={() => form.trigger("month")}
                                                                                    disabled={form.getValues().month === undefined}
                                                                                    className={cn(
                                                                                        "md:w-[200px] w-[160px] justify-center text-center h-12 active:scale-95",
                                                                                        !field.value && "text-muted-foreground"
                                                                                    )}
                                                                                    >
                                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                                    {field.value ? format(new Date(2023, 0, field.value), 'do') : <span>Select Day</span>}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="md:w-[200px] w-[160px] px-0 py-1 flex flex-wrap justify-center rounded-xl" align="start">
                                                                                <Button onClick={() => field.onChange(1)} variant={"day"} value="1">1</Button>
                                                                                <Button onClick={() => field.onChange(2)} variant={"day"} value="2">2</Button>
                                                                                <Button onClick={() => field.onChange(3)} variant={"day"} value="3">3</Button>
                                                                                <Button onClick={() => field.onChange(4)} variant={"day"} value="4">4</Button>
                                                                                <Button onClick={() => field.onChange(5)} variant={"day"} value="5">5</Button>
                                                                                <Button onClick={() => field.onChange(6)} variant={"day"} value="6">6</Button>
                                                                                <Button onClick={() => field.onChange(7)} variant={"day"} value="7">7</Button>
                                                                                <Button onClick={() => field.onChange(8)} variant={"day"} value="8">8</Button>
                                                                                <Button onClick={() => field.onChange(9)} variant={"day"} value="9">9</Button>
                                                                                <Button onClick={() => field.onChange(10)} variant={"day"} value="10">10</Button>
                                                                                <Button onClick={() => field.onChange(11)} variant={"day"} value="11">11</Button>
                                                                                <Button onClick={() => field.onChange(12)} variant={"day"} value="12">12</Button>
                                                                                <Button onClick={() => field.onChange(13)} variant={"day"} value="13">13</Button>
                                                                                <Button onClick={() => field.onChange(14)} variant={"day"} value="14">14</Button>
                                                                                <Button onClick={() => field.onChange(15)} variant={"day"} value="15">15</Button>
                                                                                <Button onClick={() => field.onChange(16)} variant={"day"} value="16">16</Button>
                                                                                <Button onClick={() => field.onChange(17)} variant={"day"} value="17">17</Button>
                                                                                <Button onClick={() => field.onChange(18)} variant={"day"} value="18">18</Button>
                                                                                <Button onClick={() => field.onChange(19)} variant={"day"} value="19">19</Button>
                                                                                <Button onClick={() => field.onChange(20)} variant={"day"} value="20">20</Button>
                                                                                <Button onClick={() => field.onChange(21)} variant={"day"} value="21">21</Button>
                                                                                <Button onClick={() => field.onChange(22)} variant={"day"} value="22">22</Button>
                                                                                <Button onClick={() => field.onChange(23)} variant={"day"} value="23">23</Button>
                                                                                <Button onClick={() => field.onChange(24)} variant={"day"} value="24">24</Button>
                                                                                <Button onClick={() => field.onChange(25)} variant={"day"} value="25">25</Button>
                                                                                <Button onClick={() => field.onChange(26)} variant={"day"} value="26">26</Button>
                                                                                <Button onClick={() => field.onChange(27)} variant={"day"} value="27">27</Button>
                                                                                <Button onClick={() => field.onChange(28)} variant={"day"} value="28">28</Button>
                                                                                <Button onClick={() => field.onChange(29)} disabled={form.getValues().month === 1} variant={"day"} value="29">29</Button>
                                                                                <Button onClick={() => field.onChange(30)} disabled={form.getValues().month === 1} variant={"day"} value="30">30</Button>
                                                                                <Button onClick={() => field.onChange(31)} disabled={shortMonths.includes(form.getValues().month)} variant={"day"} value="31">31</Button>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </div>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}/>
                                                </div>
                                                <div className='flex justify-center'>
                                                    <div className='flex flex-col mr-14'>
                                                            <FormField control={form.control} name="name" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <div className="w-full flex justify-end items-center text-lg md:text-xl mt-4 mx-1 h-12">
                                                                            <div className="mr-2 md:text-lg text-base text-muted-foreground font-medium">
                                                                                Name
                                                                            </div>
                                                                            <input disabled={!form.getValues().day} value={field.value} onChange={field.onChange} id='name' className='w-32 border-b-2 bg-transparent focus-visible:outline-none' />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name="lastName" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <div className="w-full flex justify-end items-center text-lg md:text-xl mx-1 h-12">
                                                                            <div className="mr-2 md:text-lg text-base text-muted-foreground font-medium">
                                                                                Last Name
                                                                            </div>
                                                                            <input disabled={!form.getValues().day} value={field.value} onChange={field.onChange} id='lastname' className='w-32 border-b-2 bg-transparent focus-visible:outline-none' />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}/>
                                                    </div>
                                                </div>
                                                <div className='flex justify-center mt-6 md:text-lg text-base text-muted-foreground font-medium'>Email Reminders</div>
                                                <div className="flex md:gap-8 gap-4 my-4 justify-center">
                                                    <div className='flex flex-col gap-4'>
                                                        <FormField control={form.control} name="onDay" render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className='flex w-fit items-center justify-start'>
                                                                        <Switch id="onDay" checked={field.value} onCheckedChange={field.onChange} />
                                                                        <label htmlFor="onDay" className="text-muted-foreground ml-2 text-sm min-[375px]:text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                            On Day
                                                                        </label>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}/>
                                                        <FormField control={form.control} name="dayBefore" render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className='flex w-fit items-center justify-start'>
                                                                        <Switch id="dayBefore" checked={field.value} onCheckedChange={field.onChange} />
                                                                        <label htmlFor="dayBefore" className="text-muted-foreground ml-2 text-sm min-[375px]:text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                            Day Before
                                                                        </label>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}/>
                                                    </div>
                                                    <div className='flex flex-col gap-4'>
                                                        <FormField control={form.control} name="oneWeekBefore" render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className='flex w-fit items-center justify-start'>
                                                                        <Switch id="oneWeekBefore" checked={field.value} onCheckedChange={field.onChange} />
                                                                        <label htmlFor="oneWeekBefore" className="text-muted-foreground ml-2 text-sm min-[375px]:text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                            1 Week Before
                                                                        </label>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}/>
                                                        <FormField control={form.control} name="twoWeeksBefore" render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className='flex w-fit items-center justify-start'>
                                                                        <Switch id="twoWeeksBefore" checked={field.value} onCheckedChange={field.onChange} />
                                                                        <label htmlFor="twoWeeksBefore" className="text-muted-foreground ml-2 text-sm min-[375px]:text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                            2 Weeks Before
                                                                        </label>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}/>
                                                    </div>
                                                </div>
                                                <div className='flex justify-end mt-8'>
                                                    <DialogClose disabled={!form.formState.isValid} asChild>
                                                        <Button type="submit" variant='outline' className='active:scale-95 md:text-lg text-base text-muted-foreground font-medium h-10 w-[130px]'>
                                                            Add
                                                        </Button>
                                                    </DialogClose>
                                                </div>
                                            </form>
                                        </Form>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div> 
            </motion.div>
            
        </>

    )
}