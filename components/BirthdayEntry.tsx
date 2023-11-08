'use client'

import { Birthday } from "@/app/types";
import { Button } from "./ui/button";
import { useAtom, useSetAtom } from "jotai";
import format from "date-fns/format";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { CalendarIcon } from '@radix-ui/react-icons';
import { motion } from "framer-motion";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { BirthdaySchema } from "@/app/types";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { birthdaysAtom, sortBirthdaysAtom } from '@/app/Atoms';



const API_URL = 'https://api.birthdays.run';

const saveBirthday = async (birthday: Birthday, sessionId: string) => {
    await fetch(API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionId,
        },
        body: JSON.stringify(birthday),
    });
};


const deleteBirthday = async (id: string, sessionId: string) => {
    await fetch(API_URL, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionId,
        },
        body: JSON.stringify({ birthdayId: id }),
    });
};


export default function BirthdayEntry({ birthdayObj, sessionId }: { birthdayObj: Birthday; sessionId: string; }) {
    
    const [birthdays, setBirthdays] = useAtom(birthdaysAtom);
    const sortBirthdays = useSetAtom(sortBirthdaysAtom);

    const reminders = [];
    if (birthdayObj.onDay) reminders.push("On Day");
    if (birthdayObj.dayBefore) reminders.push("Day Before");
    if (birthdayObj.oneWeekBefore) reminders.push("1 Week Before");
    if (birthdayObj.twoWeeksBefore) reminders.push("2 Weeks Before");


    const form = useForm<Birthday>({
        resolver: zodResolver(BirthdaySchema),
        values: {
            id: birthdayObj.id,
            userId: birthdayObj.userId,
            day: birthdayObj.day,
            month: birthdayObj.month,
            nextBirthday: birthdayObj.nextBirthday,
            name: birthdayObj.name,
            lastName: birthdayObj.lastName ?? "",
            onDay: birthdayObj.onDay,
            dayBefore: birthdayObj.dayBefore,
            oneWeekBefore: birthdayObj.oneWeekBefore,
            twoWeeksBefore: birthdayObj.twoWeeksBefore
        },
    });

    const onSubmit = (updatedBirthday: Birthday) => {
        let nextB = new Date(new Date().getFullYear(), updatedBirthday.month, updatedBirthday.day, 12, 30);
        let nextBUnix = Date.parse(nextB.toString());
        let currentTUnix = Date.parse(new Date().toString());
        if (nextBUnix < currentTUnix) {
            nextB.setFullYear(nextB.getFullYear() + 1);
            nextBUnix = Date.parse(nextB.toString());
        }
        updatedBirthday.nextBirthday = nextBUnix;
        saveBirthday(updatedBirthday, sessionId);
        let newBirthdays = [...birthdays];
        newBirthdays.splice((newBirthdays.findIndex(birthday => birthday.id === updatedBirthday.id)), 1, updatedBirthday);
        setBirthdays([...newBirthdays]);
        sortBirthdays();
        form.reset();
    };

    const onDelete = () => {
        deleteBirthday(birthdayObj.id, sessionId);
        let newBirthdays = [...birthdays];
        newBirthdays.splice((birthdays.findIndex(birthday => birthday.id === birthdayObj.id)), 1);
        setBirthdays([...newBirthdays]);
        sortBirthdays();
        form.reset();
    };

    const date = new Date(birthdayObj.nextBirthday);

    const shortMonths = [1, 3, 5, 8, 10];

    return (
            <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 0 }}
                whileHover={{ scale: 1.03 }}
                className="transition-transform ease-out px-1 md:p-3 flex flex-col text-lg items-center md:text-xl my-2 h-16 md:h-20 rounded-xl border hover:text-card-foreground md:hover:bg-accent md:hover:border-neutral-300 md:dark:hover:border-neutral-800 md:dark:hover:bg-card/90 md:hover:shadow-sm md:active:shadow-inner">
                    <div className="flex w-full items-center justify-between mt-2 md:mt-2 h-full">
                        <div className="md:ml-3 sm:ml-4 ml-3">
                            <img src='/birthdays.svg' className="h-8 md:h-10" alt='birthday' />
                        </div>
                        <div className="flex md:text-lg text-base font-medium md:font-normal" >
                            {format(date, "do LLLL")}{" - "}{birthdayObj.name}{" "}{birthdayObj.lastName ? birthdayObj.lastName.at(0) + "." : null}
                        </div>
                        <div className="flex" >

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button onClick={() => form.reset()} variant="ghost" size="icon" className="mr-2">
                                        <Pencil1Icon className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
                                        <span className="sr-only">Edit Birthday</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <div className='flex flex-col justify-center text-center'>
                                        <div className='mt-2 mb-3 md:text-lg text-base text-accent-foreground font-medium text-center'>Edit Birthday</div>
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
                                                                                        onClick={() => {if (form.getValues().day === 31 || form.getValues().day === 30 || form.getValues().day === 29) form.setValue("day", 1)}}
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
                                                                                <PopoverContent onClick={() => form.trigger("day")} className="md:w-[200px] w-[160px] px-0 py-1 flex flex-wrap justify-center rounded-xl" align="start">
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
                                                                                <input value={field.value} onChange={field.onChange} className='w-32 border-b-2 bg-transparent focus-visible:outline-none' />
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
                                                                                <input value={field.value} onChange={field.onChange} className='w-32 border-b-2 bg-transparent focus-visible:outline-none' />
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
                                                    <div className='flex justify-between mt-8'>
                                                        <DialogClose asChild>
                                                            <Button onClick={() => onDelete()} variant='ghost' className='active:scale-95 md:text-lg text-base text-muted-foreground font-medium h-10 w-[130px]'>
                                                                Delete
                                                            </Button>
                                                        </DialogClose>
                                                        <DialogClose disabled={!form.formState.isValid} asChild>
                                                            <Button type="submit" variant='outline' className='active:scale-95 md:text-lg text-base text-muted-foreground font-medium h-10 w-[130px]'>
                                                                Save
                                                            </Button>
                                                        </DialogClose>
                                                    </div>
                                                </form>
                                            </Form>
                                    </div>
                                </DialogContent>
                            </Dialog>                           
                        </div>
                    </div>
                    <div className="flex justify-center w-full -mt-2 md:-mt-0 text-xs text-muted-foreground">
                        Reminders: {reminders.join(", ")}
                    </div>
            </motion.div>
    )
}

