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
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Edit } from 'lucide-react';
import { useState } from "react"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Team } from "@prisma/client";
import { teamSchema } from "~/types/schema";
import { TRPCClientError } from "@trpc/client";

type Props = {
    team: Team
}

export default function EditTeamModal({ team }: Props) {
  const router = useRouter();

  const updateTeam = api.team.updateTeam.useMutation();

  const [open, setOpen] = useState(false);

  const [teamName, setTeamName] = useState(team.name);
  const [descriptionName, setDescriptionName] = useState(team.description ? team.description : "");

  const handleSubmit = async () => {
    const data = {
      name: teamName,
      description: descriptionName
    }
    const validationResult = teamSchema.safeParse(data);

    if (!validationResult.success) {
      const path = validationResult.error.errors[0]?.path[0];
      if (path === "name") toast.error("Please enter a name.");
      return;
    } else {
      toast.promise(updateTeam.mutateAsync({ teamId: team.teamId, ...data }), {
        loading: "Updating team...",
        success:  () => {
          // Reload the page upon successful submission
          router.refresh();
          setOpen(false);
          return "Team updated :)";
        },
        error: (error) => { 
          if (error instanceof TRPCClientError) {
            return error.message;
          } else {
            return "Failed to update team :(";
          }
        }
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
            <Edit className="w-8 h-8"/>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
          <DialogDescription>
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              className="col-span-3"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              className="col-span-3"
              value={descriptionName}
              onChange={(e) => setDescriptionName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button 
                type="button"
                variant="secondary"
            >
                Cancel
            </Button>
          </DialogClose>
          <Button 
              type="submit"
              onClick={async () => {
                  if (teamName === team.name && descriptionName === team.description) {
                      toast("No changes detected");
                      return;
                  }
                  await handleSubmit();
              }}
          >
              Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
