import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROLES = ['learner', 'mentor', 'professional', 'company', 'admin', 'super_admin'] as const;

const PERMISSIONS = [
  // learning
  'courses:view', 'courses:create', 'courses:publish',
  // productivity
  'goals:manage', 'tasks:manage', 'roadmaps:manage',
  // mentorship
  'mentorship:request', 'mentees:manage', 'mentees:message', 'mentorship:approve',
  // events
  'events:register', 'events:create',
  // community
  'community:access',
  // company
  'jobs:manage',
  // admin
  'admin:users:manage', 'admin:courses:manage', 'admin:mentors:manage', 'admin:events:manage',
  'admin:emails:manage', 'admin:reports:view', 'admin:community:manage', 'admin:credentials:manage', 'admin:payments:manage', 'admin:settings:manage',
] as const;

const ROLE_PERMISSIONS: Record<(typeof ROLES)[number], (typeof PERMISSIONS)[number][]> = {
  learner: ['courses:view', 'goals:manage', 'tasks:manage', 'roadmaps:manage', 'mentorship:request', 'events:register', 'community:access'],
  mentor: ['courses:view', 'mentees:manage', 'mentees:message', 'events:create', 'events:register', 'community:access'],
  professional: ['courses:view', 'goals:manage', 'tasks:manage', 'events:register', 'community:access'],
  company: ['community:access', 'jobs:manage'],
  admin: [
    'admin:users:manage', 'admin:courses:manage', 'admin:mentors:manage', 'admin:events:manage',
    'admin:emails:manage', 'admin:reports:view', 'admin:community:manage', 'admin:credentials:manage', 'admin:payments:manage', 'admin:settings:manage', 'courses:create', 'courses:publish', 'mentorship:approve',
  ],
  super_admin: [...PERMISSIONS],
};

async function main() {
  const permissionRecords = await Promise.all(
    PERMISSIONS.map((key) => prisma.permission.upsert({ where: { key }, update: {}, create: { key } })),
  );
  const permissionByKey = new Map(permissionRecords.map((p) => [p.key, p.id]));

  for (const roleName of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    const grants = ROLE_PERMISSIONS[roleName];
    for (const permKey of grants) {
      const permissionId = permissionByKey.get(permKey);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }

  // Recommended roadmap templates (spec section 9: "recommended roadmaps
  // for supported career paths"). Cloned into a learner's own Roadmap via
  // POST /productivity/roadmaps/templates/:id/clone.
  const templateCount = await prisma.roadmap.count({ where: { isTemplate: true } });
  if (templateCount === 0) {
    await prisma.roadmap.create({
      data: {
        title: 'Frontend Development Roadmap',
        careerPath: 'Frontend Development',
        isTemplate: true,
        milestones: {
          create: [
            { title: 'HTML & CSS', order: 0 },
            { title: 'JavaScript', order: 1 },
            { title: 'Git & GitHub', order: 2 },
            { title: 'Vue 3', order: 3 },
            { title: 'APIs & Fetch', order: 4 },
            { title: 'Build a portfolio project', order: 5 },
            { title: 'Assessment', order: 6 },
            { title: 'Certification', order: 7 },
          ],
        },
      },
    });

    await prisma.roadmap.create({
      data: {
        title: 'Backend Development Roadmap',
        careerPath: 'Backend Development',
        isTemplate: true,
        milestones: {
          create: [
            { title: 'Programming fundamentals', order: 0 },
            { title: 'Node.js & TypeScript', order: 1 },
            { title: 'Databases & SQL', order: 2 },
            { title: 'REST API design', order: 3 },
            { title: 'Authentication & security', order: 4 },
            { title: 'Build a full API project', order: 5 },
            { title: 'Assessment', order: 6 },
            { title: 'Certification', order: 7 },
          ],
        },
      },
    });

    await prisma.roadmap.create({
      data: {
        title: 'Data Science Roadmap',
        careerPath: 'Data Science',
        isTemplate: true,
        milestones: {
          create: [
            { title: 'Python fundamentals', order: 0 },
            { title: 'Statistics & probability', order: 1 },
            { title: 'Pandas & data wrangling', order: 2 },
            { title: 'Data visualization', order: 3 },
            { title: 'Machine learning basics', order: 4 },
            { title: 'Capstone project', order: 5 },
            { title: 'Assessment', order: 6 },
            { title: 'Certification', order: 7 },
          ],
        },
      },
    });
  }

  console.log('Seed complete: roles + permissions bootstrapped, roadmap templates ready.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
