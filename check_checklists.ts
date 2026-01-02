import { prisma } from "./portal/lib/prisma";

async function main() {
  const checklists = await prisma.checklist.findMany({
    include: { items: true }
  });
  console.log(JSON.stringify(checklists, null, 2));
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.()
  })
