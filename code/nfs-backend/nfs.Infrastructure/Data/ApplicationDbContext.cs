using Microsoft.EntityFrameworkCore;
using nfs.Domain.Entities;
using System.Reflection.Emit;

namespace nfs.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<AvailabilitySlot> AvailabilitySlots { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<SessionNote> SessionNotes { get; set; }
        public DbSet<Therapist> Therapists { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Specialization> Specializations { get; set; }
        public DbSet<TherapistSpecialization> TherapistSpecializations { get; set; }
        public DbSet<PatientMedicalHistory> PatientMedicalHistories { get; set; }
        public DbSet<Assessment> Assessments { get; set; }
        public DbSet<AssessmentResult> AssessmentResults { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Therapist configuration
            modelBuilder.Entity<Therapist>()
                .HasKey(t => t.Id);

            modelBuilder.Entity<Therapist>()
                .HasMany(t => t.Specializations)
                .WithOne(ts => ts.Therapist)
                .HasForeignKey(ts => ts.TherapistId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Therapist>()
                .HasMany(t => t.Appointments)
                .WithOne()
                .HasForeignKey("TherapistId")
                .OnDelete(DeleteBehavior.Restrict);

            // Patient configuration
            modelBuilder.Entity<Patient>()
                .HasKey(p => p.Id);

            modelBuilder.Entity<Patient>()
                .HasMany(p => p.MedicalHistories)
                .WithOne(pmh => pmh.Patient)
                .HasForeignKey(pmh => pmh.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Patient>()
                .HasMany(p => p.Assessments)
                .WithOne(a => a.Patient)
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Specialization configuration
            modelBuilder.Entity<Specialization>()
                .HasKey(s => s.Id);

            // TherapistSpecialization configuration
            modelBuilder.Entity<TherapistSpecialization>()
                .HasKey(ts => ts.Id);

            modelBuilder.Entity<TherapistSpecialization>()
                .HasOne(ts => ts.Specialization)
                .WithMany(s => s.TherapistSpecializations)
                .HasForeignKey(ts => ts.SpecializationId)
                .OnDelete(DeleteBehavior.Restrict);

            // PatientMedicalHistory configuration
            modelBuilder.Entity<PatientMedicalHistory>()
                .HasKey(pmh => pmh.Id);

            // Assessment configuration
            modelBuilder.Entity<Assessment>()
                .HasKey(a => a.Id);

            modelBuilder.Entity<Assessment>()
                .HasMany(a => a.Results)
                .WithOne(ar => ar.Assessment)
                .HasForeignKey(ar => ar.AssessmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Assessment>()
                .HasOne(a => a.Therapist)
                .WithMany()
                .HasForeignKey(a => a.TherapistId)
                .OnDelete(DeleteBehavior.SetNull);

            // AssessmentResult configuration
            modelBuilder.Entity<AssessmentResult>()
                .HasKey(ar => ar.Id);

            // Add indexes for better query performance
            modelBuilder.Entity<Therapist>()
                .HasIndex(t => t.VerificationStatus);

            modelBuilder.Entity<Therapist>()
                .HasIndex(t => t.IsAvailable);

            modelBuilder.Entity<Patient>()
                .HasIndex(p => p.IsActive);

            modelBuilder.Entity<Assessment>()
                .HasIndex(a => a.Status);

            modelBuilder.Entity<Assessment>()
                .HasIndex(a => a.PatientId);
        }
    }
}