import { atom } from "jotai";
import { Birthday } from "./types";


export const birthdaysAtom = atom<Birthday[]>([]);

export const sortBirthdaysAtom = atom(
    null,
    (get, set) => {
        let birthdays = get(birthdaysAtom)
        birthdays.sort((a, b) => a.nextBirthday - b.nextBirthday);
        set(birthdaysAtom, birthdays)
    }
);


export const userEmailAtom = atom('');

