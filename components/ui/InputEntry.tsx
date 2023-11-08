import React from "react";

export default function InputEntry({ name }: { name: string }) {

    const title = name.charAt(0).toUpperCase() + name.slice(1);

    return (
        <div 
        className="flex gap-2 items-center justify-end mt-2 mx-1 mr-4 h-12">
            <div className="w-fit md:text-lg text-base text-muted-foreground font-medium">
                {title}
            </div>
            <div>
                <input type={name} name={name} id={name} className='w-56 border-b-2 bg-transparent pl-2 text-base focus-visible:outline-none' />
            </div>
        </div>
    )
}