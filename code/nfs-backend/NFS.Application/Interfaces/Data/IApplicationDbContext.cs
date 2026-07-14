using Microsoft.EntityFrameworkCore;
using NFS.Domain.Entities;

namespace NFS.Application.Interfaces.Data
{
    public interface IApplicationDbContext
    {
        DbSet<User> Users { get; }
        DbSet<Role> Roles { get; }
        DbSet<UserRoleMapping> UserRoles { get; }
        DbSet<ExternalLogin> ExternalLogins { get; }
        DbSet<Patient> Patients { get; }
        DbSet<Therapist> Therapists { get; }
        DbSet<Assessment> Assessments { get; }
        DbSet<AssessmentResult> AssessmentResults { get; }
        DbSet<Specialization> Specializations { get; }
        DbSet<Appointment> Appointments { get; }
        DbSet<AvailabilitySlot> AvailabilitySlots { get; }
        DbSet<Session> Sessions { get; }
        DbSet<SessionNote> SessionNotes { get; }
        DbSet<DiaryEntry> DiaryEntries { get; }
        DbSet<Payment> Payments { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
