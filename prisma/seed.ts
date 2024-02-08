import { type Prisma, PrismaClient, Role } from "@prisma/client";
import { users } from "./data/users";
import { teams } from "./data/teams";

const prisma = new PrismaClient();

// reset database first by deleting all records
await prisma.teamMember.deleteMany({});
await prisma.team.deleteMany({});

await prisma.account.deleteMany({});
await prisma.session.deleteMany({});
await prisma.verificationToken.deleteMany({});
await prisma.user.deleteMany({});

// populate database
async function main() {
    // create users
    await prisma.user.createMany({
        data: users
    })

    // retrieve userIds
    let userIds: string[] = [];
    const userIdsObject = await prisma.user.findMany({ select: { id: true }});
    userIds = userIdsObject.map(user => user.id);

    // assign userIds to team.createdBy
    const teamsWithCreatedBy = teams.map((team) => ({
        ...team,
        createdBy: userIds[Math.floor(Math.random() * userIds.length)]!,
    }));

    for (const team of teamsWithCreatedBy) {
        // create team
        const newTeam = await prisma.team.create({
            data: team
        });

        // randomly choose users to be team members for a team
        const ownerIdIndex = userIds.findIndex(userId => userId === newTeam.createdBy);
        let adminIdIndex = Math.floor(Math.random() * userIds.length);
        while (adminIdIndex === ownerIdIndex) {
            adminIdIndex = Math.floor(Math.random() * userIds.length);
        }
        let normalIdIndex1 = Math.floor(Math.random() * userIds.length);
        while (normalIdIndex1 === ownerIdIndex || normalIdIndex1 === adminIdIndex) {
            normalIdIndex1 = Math.floor(Math.random() * userIds.length);
        }
        let normalIdIndex2 = Math.floor(Math.random() * userIds.length);
        while (normalIdIndex2 === ownerIdIndex || normalIdIndex2 === adminIdIndex || normalIdIndex2 === normalIdIndex1) {
            normalIdIndex2 = Math.floor(Math.random() * userIds.length);
        }

        // define team member data for each team
        const teamMemberData: Prisma.TeamMemberCreateManyInput | Prisma.TeamMemberCreateManyInput[] = [
            {
                role: Role.owner,
                teamId: newTeam.teamId,
                userId: newTeam.createdBy
            },
            {
                role: Role.admin,
                teamId: newTeam.teamId,
                userId: userIds[adminIdIndex]!
            },
            {
                role: Role.normal,
                teamId: newTeam.teamId,
                userId: userIds[normalIdIndex1]!
            },
            {
                role: Role.normal,
                teamId: newTeam.teamId,
                userId: userIds[normalIdIndex2]!
            }
        ];
    
        // create team member record for a team
        await prisma.teamMember.createMany({
            data: teamMemberData,
        });
    }
}

main()
.catch((e) => {
    console.log(e);
    process.exit(1);
})
.finally(() => {prisma.$disconnect().catch(console.error);})