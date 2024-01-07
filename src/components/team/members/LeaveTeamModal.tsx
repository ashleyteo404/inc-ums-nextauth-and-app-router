"use client"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { TRPCClientError } from "@trpc/client";
import { useSession } from "next-auth/react"

type Props = {
  teamMemberId: string
}

export default function LeaveTeamMemberModal({ teamMemberId }: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const leaveTeam = api.teamMember.leaveTeam.useMutation();

  const handleSubmit = async () => {
    toast.promise(leaveTeam.mutateAsync({ teamMemberId: teamMemberId }), {
        loading: "Leaving team...",
        success:  () => {
          router.replace(`/profile/${session?.user.id}`);
          return "You left the team :)";
        },
        error: (error) => { 
          if (error instanceof TRPCClientError) {
            return error.message;
          } else {
            return "Failed to leave team :(";
          }
        }
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"destructive"}>
            Leave Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
        <DialogTitle>Are you sure absolutely sure?</DialogTitle>
        <DialogDescription>
            You can still rejoin this team later if need be, if it still exists.
        </DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <DialogClose asChild>
            <Button 
                type="button"
                variant="secondary"
            >
                Cancel
            </Button>
            </DialogClose>
            <DialogClose asChild>
            <Button 
                type="submit"
                onClick={async () => {
                  await handleSubmit();
                }}
            >
                Leave Team
            </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
