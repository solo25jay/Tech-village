import { reportsRepository } from './reports.repository';

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export const reportsService = {
  async getSummary() {
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      learners,
      mentors,
      professionals,
      companies,
      enrollments,
      completedEnrollments,
      certificates,
      activeMentorships,
      upcomingEvents,
      openJobs,
      applications,
      applicationsByStatus,
      qualifiedProfessionals,
      revenue,
      registrationDates,
    ] = await Promise.all([
      reportsRepository.countUsers(),
      reportsRepository.countActiveUsers(),
      reportsRepository.countUsersWithRole('learner'),
      reportsRepository.countUsersWithRole('mentor'),
      reportsRepository.countUsersWithRole('professional'),
      reportsRepository.countUsersWithRole('company'),
      reportsRepository.countEnrollments(),
      reportsRepository.countCompletedEnrollments(),
      reportsRepository.countCertificates(),
      reportsRepository.countActiveMentorships(),
      reportsRepository.countUpcomingEvents(),
      reportsRepository.countOpenJobs(),
      reportsRepository.countApplications(),
      reportsRepository.applicationsByStatus(),
      reportsRepository.countQualifiedProfessionals(),
      reportsRepository.sumRevenueKobo(),
      reportsRepository.listRegistrationDates(since),
    ]);

    // Build a zero-filled 30-day series so the chart has no gaps on quiet days.
    const counts = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      counts.set(dayKey(d), 0);
    }
    for (const { createdAt } of registrationDates) {
      const key = dayKey(createdAt);
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const registrationsLast30Days = Array.from(counts, ([date, count]) => ({ date, count }));

    return {
      users: { total: totalUsers, active: activeUsers, learners, mentors, professionals, companies },
      learning: {
        enrollments,
        completedEnrollments,
        completionRatePercent: enrollments > 0 ? Math.round((completedEnrollments / enrollments) * 100) : 0,
        certificatesIssued: certificates,
      },
      mentorship: { activeMentorships },
      events: { upcoming: upcomingEvents },
      jobs: {
        openJobs,
        applications,
        applicationsByStatus: applicationsByStatus.map((row) => ({ status: row.status, count: row._count._all })),
      },
      community: { qualifiedProfessionals },
      revenueKobo: revenue._sum.amountKobo ?? 0,
      registrationsLast30Days,
    };
  },
};
