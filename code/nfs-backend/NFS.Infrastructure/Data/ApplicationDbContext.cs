using Microsoft.EntityFrameworkCore;
using NFS.Application.Interfaces.Data;
using NFS.Domain.Entities;
using NFS.Domain.Enums;

namespace NFS.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<UserRoleMapping> UserRoles => Set<UserRoleMapping>();
        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<Therapist> Therapists => Set<Therapist>();
        public DbSet<Assessment> Assessments => Set<Assessment>();
        public DbSet<AssessmentResult> AssessmentResults => Set<AssessmentResult>();
        public DbSet<Specialization> Specializations => Set<Specialization>();
        public DbSet<TherapistSpecialization> TherapistSpecializations => Set<TherapistSpecialization>();
        public DbSet<PatientMedicalHistory> PatientMedicalHistories => Set<PatientMedicalHistory>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
        public DbSet<AvailabilitySlot> AvailabilitySlots => Set<AvailabilitySlot>();
        public DbSet<Session> Sessions => Set<Session>();
        public DbSet<SessionNote> SessionNotes => Set<SessionNote>();
        public DbSet<DiaryEntry> DiaryEntries => Set<DiaryEntry>();
        public DbSet<Payment> Payments => Set<Payment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(u => u.UserId);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Gender)
                    .HasConversion(
                        v => v.HasValue ? v.Value.ToString() : null,
                        v => v == null ? null : Enum.Parse<Gender>(v));
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("Roles");
                entity.HasKey(r => r.RoleId);
                entity.HasIndex(r => r.RoleName).IsUnique();
            });

            modelBuilder.Entity<UserRoleMapping>(entity =>
            {
                entity.ToTable("UserRoles");
                entity.HasKey(ur => ur.UserRoleId);
                entity.HasIndex(ur => new { ur.UserId, ur.RoleId }).IsUnique();
                entity.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(ur => ur.Assigner)
                    .WithMany()
                    .HasForeignKey(ur => ur.AssignedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Patient>(entity =>
            {
                entity.ToTable("Patients");
                entity.HasKey(p => p.PatientId);
                entity.HasIndex(p => p.UserId).IsUnique();
                entity.HasOne(p => p.User)
                    .WithOne(u => u.Patient)
                    .HasForeignKey<Patient>(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Therapist>(entity =>
            {
                entity.ToTable("Therapists");
                entity.HasKey(t => t.TherapistId);
                entity.HasIndex(t => t.UserId).IsUnique();
                entity.HasOne(t => t.User)
                    .WithOne(u => u.Therapist)
                    .HasForeignKey<Therapist>(t => t.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Assessment>(entity =>
            {
                entity.ToTable("Assessments");
                entity.HasKey(a => a.AssessmentId);
                entity.HasOne(a => a.Patient)
                    .WithMany()
                    .HasForeignKey(a => a.PatientId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(a => a.Therapist)
                    .WithMany()
                    .HasForeignKey(a => a.TherapistId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<AssessmentResult>(entity =>
            {
                entity.ToTable("AssessmentResults");
                entity.HasKey(r => r.AssessmentResultId);
                // Prevent cascade delete to Patient to avoid multiple cascade paths
                entity.HasOne(r => r.Patient)
                      .WithMany()
                      .HasForeignKey(r => r.PatientId)
                      .OnDelete(DeleteBehavior.NoAction);
                // Keep cascade delete from Assessment (optional, safe)
                entity.HasOne(r => r.Assessment)
                      .WithMany()
                      .HasForeignKey(r => r.AssessmentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Specialization>(entity =>
            {
                entity.ToTable("Specializations");
                entity.HasKey(s => s.Id);
            });

            modelBuilder.Entity<TherapistSpecialization>(entity =>
            {
                entity.ToTable("TherapistSpecializations");
                entity.HasKey(ts => new { ts.TherapistId, ts.SpecializationId });
            });

            modelBuilder.Entity<PatientMedicalHistory>(entity =>
            {
                entity.ToTable("PatientMedicalHistories");
                entity.HasKey(h => h.PatientMedicalHistoryId);
            });

            modelBuilder.Entity<AssessmentResult>(entity =>
            {
                entity.ToTable("AssessmentResults");
                entity.HasKey(ar => ar.AssessmentResultId);
                entity.HasOne(ar => ar.Assessment)
                    .WithMany()
                    .HasForeignKey(ar => ar.AssessmentId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(ar => ar.Patient)
                    .WithMany()
                    .HasForeignKey(ar => ar.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Assessment>(entity =>
            {
                entity.ToTable("Assessments");
                entity.HasKey(a => a.AssessmentId);
                entity.HasOne(a => a.Patient)
                    .WithMany()
                    .HasForeignKey(a => a.PatientId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(a => a.Therapist)
                    .WithMany()
                    .HasForeignKey(a => a.TherapistId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.ToTable("Appointments");
                entity.HasKey(a => a.Id);
                entity.HasOne(a => a.AvailabilitySlot)
                    .WithMany()
                    .HasForeignKey(a => a.SlotId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Patient)
                    .WithMany()
                    .HasForeignKey(a => a.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Therapist)
                    .WithMany()
                    .HasForeignKey(a => a.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<AvailabilitySlot>(entity =>
            {
                entity.ToTable("AvailabilitySlots");
                entity.HasKey(s => s.Id);
            });

            modelBuilder.Entity<Session>(entity =>
            {
                entity.ToTable("Sessions");
                entity.HasKey(s => s.Id);
                entity.HasOne(s => s.Appointment)
                    .WithOne(a => a.Session)
                    .HasForeignKey<Session>(s => s.AppointmentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<SessionNote>(entity =>
            {
                entity.ToTable("SessionNotes");
                entity.HasKey(n => n.Id);
            });

            modelBuilder.Entity<DiaryEntry>(entity =>
            {
                entity.ToTable("DiaryEntries");
                entity.HasKey(d => d.Id);
                entity.HasOne(d => d.Patient)
                    .WithMany()
                    .HasForeignKey(d => d.PatientId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.ToTable("Payments");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Amount).HasColumnType("decimal(18,2)");
                entity.HasOne(p => p.Patient)
                    .WithMany()
                    .HasForeignKey(p => p.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(p => p.Doctor)
                    .WithMany()
                    .HasForeignKey(p => p.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(p => p.Appointment)
                    .WithMany()
                    .HasForeignKey(p => p.AppointmentId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
