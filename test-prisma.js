const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    console.log('Attempting to connect to Prisma...');
    await prisma.$connect();
    console.log('Successfully connected to Prisma using native engine!');
    const leadsCount = await prisma.lead.count();
    console.log(`Leads in database: ${leadsCount}`);
  } catch (error) {
    console.error('Prisma connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
