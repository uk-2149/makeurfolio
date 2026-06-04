const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function test() {
  const portfolio = await prisma.portfolio.findFirst({
    include: { experiences: true, projects: true, skills: true }
  });
  if (!portfolio) return console.log("no portfolio");

  console.log("Found portfolio", portfolio.id);
  
  try {
    const rawJson = JSON.parse(JSON.stringify(portfolio));
    const { id, userId, createdAt, updatedAt, experiences, educations, skills, projects, certifications, achievements, socialLinks, templateId, ...rawBase } = rawJson;
    
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: rawBase
    });
    console.log("Success with rawBase!");
  } catch (e) {
    console.error("Prisma error:", e.message);
  }
}
test().then(()=>process.exit(0));
