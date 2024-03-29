"use client"

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";

function AuthButton() {
    const { data: session } = useSession();
    if (session?.user) {
        return (
            <>
                Signed in as 
                <div className="ml-1 mr-3 font-bold">
                    {session?.user?.name} 
                </div>
                <Link
                  href={"/api/auth/signout"}
                >
                    <Button variant={"link"} className="bg-[#300D4F] text-muted">
                        Sign Out
                    </Button>
                </Link>
            </>
        )
    } else {
        return (
            <>
                <Link
                  href={"/signIn"}
                >
                    <Button variant={"link"} className="bg-[#300D4F] text-muted">
                        Sign In
                    </Button>
                </Link>
            </>
        )
    }
}

export default function Navbar() {
    const { data: session } = useSession();

    return(
        <div className="flex items-center justify-between p-4 shadow-md">
            <div className="flex items-center justify-center space-x-3">
                <Link href={`/`} className="flex items-center">
                    <Button variant={"default"}>
                        Home
                    </Button>
                </Link>
                {session && session.user && (<Link href={`/profile/${session.user.id}`} className="flex items-center">
                    <Button variant={"link"}>
                        Profile
                    </Button>
                </Link>)}
            </div>
            <div className="flex items-center">
                <AuthButton />
            </div>
        </div>
    )
}