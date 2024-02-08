"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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
import { api } from "~/trpc/react"
import bcrypt from "bcryptjs-react"
import { useRouter } from "next/navigation"
import { TRPCClientError } from "@trpc/client"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Password must be at least 8 characters."
  }),
  passwordCheck: z.string().min(2, {
    message: "Password must be at least 8 characters."
  })
})

export default function Register() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      passwordCheck: ""
    },
  })

  const router = useRouter();
  const registerUser = api.user.registerUser.useMutation();

  const onSubmit = async () => {
    const body = form.getValues();

    if (body.password !== body.passwordCheck) return toast.error("Passwords do not match :(");

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const data = {
        email: body.email,
        name: body.name,
        hashedPassword: hashedPassword
    }
    
    toast.promise(registerUser.mutateAsync(data), {
        loading: "Registering account...",
        success: () => {
          // Reload the page upon successful submission
          form.reset();
          router.push("/signIn");
          return "Account registered :)";
        },
        error: (error) => { 
          if (error instanceof TRPCClientError) {
            return error.message;
          } else {
            return "Failed to register account :(";
          }
        }
    })
  }

  return (
    <Card className="w-[550px] m-auto mt-10">
      <CardHeader>
        <CardTitle>Register for an account.</CardTitle>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
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
            <FormField
              control={form.control}
              name="passwordCheck"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Re-enter your password</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} type="password" />
                  </FormControl>
                  <FormDescription>
                    Passwords must match.
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
          <p>Already have an account?</p>
          <Link 
            href={"/signIn"}
            className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
          >
            Sign in here!
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}