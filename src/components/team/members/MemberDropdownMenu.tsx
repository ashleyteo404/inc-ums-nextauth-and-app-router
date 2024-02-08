import {
    MoreHorizontal,
    ShieldX,
    UserRound,
    UserRoundCheck,
    UserRoundX,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import type { teamMemberWithUserFk } from "~/types/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { api } from "~/trpc/react";
import type { Role } from "@prisma/client";
import { useState } from "react";
  
type Props = {
  member: teamMemberWithUserFk;
}

export default function MemberDropdownMenu({ member }: Props) {
  const router = useRouter();

  const [userRole, setUserRole] = useState<Role>();
  
  const { data } = api.teamMember.getUserRole.useQuery({ teamId: member.teamId }, {
    onSuccess: () => {
      setUserRole(data);
    },
    onError: (err) => {
      if (err instanceof TRPCClientError) {
        return err.message;
      } else {
        return "Failed to fetch role :(";
      }
    }
  });
  const updateRole = api.teamMember.updateRole.useMutation();
  const removeTeamMember = api.teamMember.removeTeamMember.useMutation();

  const updateAdmin = async (teamMemberId: string, role: Role) => {
    toast.promise(updateRole.mutateAsync({ teamId: member.teamId, teamMemberId: teamMemberId, role: role }), {
      loading: "Updating role...",
      success:  () => {
        router.refresh();
        return "Role updated :)";
      },
      error: (error) => { 
        if (error instanceof TRPCClientError) {
          return error.message;
        } else {
          return "Failed to update role :(";
        }
      }
    })
  }

  const removeFromTeam = async (teamMemberId: string) => {
    toast.promise(removeTeamMember.mutateAsync({ teamId: member.teamId, teamMemberId: teamMemberId }), {
        loading: "Removing member...",
        success:  () => {
          router.refresh();
          return "Member removed from team :)";
        },
        error: (error) => { 
          if (error instanceof TRPCClientError) {
            return error.message;
          } else {
            return "Failed to remove member from team :(";
          }
        }
    })
  }

  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant={"ghost"}>
            <MoreHorizontal color="#4f4f4f" />
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
            {userRole === "normal" && (<DropdownMenuItem>
                <ShieldX className="mr-2 h-4 w-4" />
                <span>Sorry, you have no perms!</span>
            </DropdownMenuItem>)}

            {userRole !== "normal" && (<>
                {member.role === "owner" && (<DropdownMenuItem>
                    <UserRoundCheck className="mr-2 h-4 w-4" />
                    <span>Owners are invincible!</span>
                </DropdownMenuItem>)}

                {member.role !== "owner" && (<>
                <DropdownMenuItem>
                    <UserRound className="mr-2 h-4 w-4" />
                    <span
                      onClick={async () => {
                        if (member.role !== "admin") await updateAdmin(member.teamMemberId, "admin");
                        else if (member.role === "admin") await updateAdmin(member.teamMemberId, "normal");
                      }}
                    >
                      {member.role !== "admin" ? "Make Admin" : "Dismiss as Admin"}
                    </span>
                    <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <UserRoundX className="mr-2 h-4 w-4" />
                    <span
                      onClick={async () => {
                        await removeFromTeam(member.teamMemberId);
                      }}
                    >
                        Remove from Team
                    </span>
                    <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
                </DropdownMenuItem>
                </>)}
            </>)}
        </DropdownMenuGroup>
    </DropdownMenuContent>
    </DropdownMenu>
  )
}
  