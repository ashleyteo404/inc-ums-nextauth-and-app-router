import type { Role } from "@prisma/client";

export type teamMemberWithUserFk = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: Role;
    teamMemberId: string;
}
