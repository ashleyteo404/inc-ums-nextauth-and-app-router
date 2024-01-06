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
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { teamSchema } from "~/types/schema"
import { TRPCClientError } from "@trpc/client"

type Props = {
  userId: string
}

const CreateTeamModal = ({ userId }: Props) => {
  const router = useRouter();

  const createTeam = api.team.createTeam.useMutation();

  const [teamName, setTeamName] = useState("");
  const [descriptionName, setDescriptionName] = useState("");

  const handleSubmit = async () => {
    const data = {
      userId: userId,
      name: teamName,
      description: descriptionName
    }
    const validationResult = teamSchema.safeParse(data);
    if (!validationResult.success) {
      const path = validationResult.error.errors[0]?.path[0];
      if (path === "name") toast.error("Please enter a name.");
      return;
    } else {
      toast.promise(createTeam.mutateAsync(data), {
        loading: "Creating team...",
        success:  () => {
          // Reload the page upon successful submission
          router.refresh();
          return "Team created :)";
        },
        error: (error) => { 
          if (error instanceof TRPCClientError) {
            return error.message;
          } else {
            return "Failed to create team :(";
          }
        }
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
            <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new team</DialogTitle>
          <DialogDescription>
            You can assign team members later.
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
          <DialogClose asChild>
            <Button 
                type="submit"
                onClick={async () => {
                  await handleSubmit();
                }}
            >
                Create Team
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTeamModal