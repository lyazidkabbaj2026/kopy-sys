import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
  console.log('--- Prisma Diagnostic ---');
  try {
    console.log('Attempting basic count...');
    const count = await prisma.lead.count();
    console.log(`Successfully counted leads: ${count}`);

    console.log('Attempting to fetch only IDs...');
    const ids = await prisma.lead.findMany({ select: { id: true }, take: 1 });
    console.log('Successfully fetched ID:', ids);

    console.log('Attempting to fetch with orderBy createdAt...');
    const ordered = await prisma.lead.findMany({ 
      orderBy: { createdAt: 'desc' },
      take: 1 
    });
    console.log('Successfully fetched with orderBy.');

    console.log('Attempting to fetch ALL fields for one lead...');
    const full = await prisma.lead.findFirst();
    console.log('Successfully fetched full lead:', full);

  } catch (error: any) {
    console.error('DIAGNOSTIC FAILED:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Metadata:', JSON.stringify(error.meta, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
