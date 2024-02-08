"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { useEffect } from "react"
import { toast } from "sonner"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(2, {
    message: "Password must be at least 8 characters."
  }),
})

const reloadSession = () => {
  const event = new Event("visibilitychange");
  document.dispatchEvent(event);
};

export default function SignIn() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  })

  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const userId = session?.user?.id;
    if (userId) {
      router.push(`/profile/${userId}`);
    }
  }, [router, session]);

  const onSubmit = async () => {
    const body = form.getValues();
    const data = {
        email: body.email,
        password: body.password
    }
    
    toast("Signing in...");

    const result = await signIn('credentials', {
        ...data,
        redirect: false
    })

    if (result?.status === 200) {
      toast.success("Signed in :)");
      reloadSession();      
    } else if (result?.status === 401) {
      toast.error("Invalid email or password :(")
    }
  }

  return (
    <Card className="w-[550px] m-auto mt-10">
      <CardHeader>
        <CardTitle>Sign in to your account.</CardTitle>
        <CardDescription>All questions are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your account&apos;s email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} type="password" />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center items-center">
        <div className="flex space-x-1">
          <p>Don&apos;t have an account?</p>
          <Link 
            href={"/register"}
            className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
          >
            Register here!
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}