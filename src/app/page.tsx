import Link from "next/link";
// import { redirect } from "next/navigation";

import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();
  // to automatically redirect signed in users
  // if (session?.user) {
  //   redirect(`/profile/${session.user.id}`)
  // }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100">
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-center text-4xl font-bold">
          INC User Management System Demo
        </h1>
        <p className="mt-4 text-center">
          This is a simple showcase of tRPC with Next.js, NextAuth, Prisma and CockroachDB.
        </p>
        <Link href={`/profile/${session?.user.id}`} className="mt-5">
          <Button variant={"default"}>
            View your teams
          </Button>
        </Link>
        <Link
          href={session ? "/api/auth/signin" : "/api/auth/signout"}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          <Button variant={"link"} className="bg-[#300D4F] text-muted">
            {session ? "Sign out" : "Sign in"}
          </Button>
        </Link>
      </div>
    </div>
  </main>

  );
}
