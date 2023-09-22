"use client"

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {BiSun} from "react-icons/bi";
import {FaMoon} from "react-icons/fa";

const ThemeButton = () => {
    const {resolvedTheme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    if(!mounted) return null

  return (
    <button
     aria-label="Toggle Dark Mode"
     type="button"
     className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
     onClick={()=>setTheme(resolvedTheme==="dark"?"light":"dark")}>
        {resolvedTheme === "dark" ?(
            <BiSun className="h-6 w-6 animate-spin"/>
        ):(
            <FaMoon className="h-6 w-6"/>
        )}
    </button>
  )
}

export default ThemeButton