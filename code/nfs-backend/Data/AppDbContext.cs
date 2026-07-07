using Microsoft.EntityFrameworkCore;
using NafsApp.Models;

namespace NafsApp.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<UserRoleMapping> UserRoles { get; set; } = null!;
        public DbSet<Therapist> Therapists { get; set; } = null!;
        public DbSet<Patient> Patients { get; set; } = null!;
        public DbSet<Assessment> Assessments { get; set; } = null!;

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // USERS configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("USERS");
                entity.HasKey(u => u.UserId);
                entity.Property(u => u.UserId).HasColumnName("user_id");
                entity.Property(u => u.FirstName).HasColumnName("first_name").HasMaxLength(100).IsRequired();
                entity.Property(u => u.LastName).HasColumnName("last_name").HasMaxLength(100).IsRequired();
                entity.Property(u => u.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
                entity.Property(u => u.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
                entity.Property(u => u.Phone).HasColumnName("phone").HasMaxLength(20);
                entity.Property(u => u.Gender).HasColumnName("gender").HasConversion<string>().HasMaxLength(50);
                entity.Property(u => u.DateOfBirth).HasColumnName("date_of_birth");
                entity.Property(u => u.ProfileImageUrl).HasColumnName("profile_image_url").HasMaxLength(500);
                entity.Property(u => u.Country).HasColumnName("country").HasMaxLength(100);
                entity.Property(u => u.Governorate).HasColumnName("governorate").HasMaxLength(100);
                entity.Property(u => u.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(u => u.IsEmailVerified).HasColumnName("is_email_verified").HasDefaultValue(false);
                entity.Property(u => u.CreatedAt).HasColumnName("created_at");
                entity.Property(u => u.UpdatedAt).HasColumnName("updated_at");
                entity.Property(u => u.RefreshToken).HasColumnName("refresh_token").HasMaxLength(500);
                entity.Property(u => u.RefreshTokenExpiryTime).HasColumnName("refresh_token_expiry");
                entity.Property(u => u.PasswordResetToken).HasColumnName("password_reset_token").HasMaxLength(500);
                entity.Property(u => u.PasswordResetTokenExpiry).HasColumnName("password_reset_token_expiry");
                entity.Property(u => u.EmailVerificationToken).HasColumnName("email_verification_token").HasMaxLength(500);

                entity.HasIndex(u => u.Email).IsUnique();
            });

            // ROLES configuration
            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("ROLES");
                entity.HasKey(r => r.RoleId);
                entity.Property(r => r.RoleId).HasColumnName("role_id");
                entity.Property(r => r.RoleName).HasColumnName("role_name").HasMaxLength(50).IsRequired();
                entity.Property(r => r.Description).HasColumnName("description").HasMaxLength(255);
                entity.Property(r => r.CreatedAt).HasColumnName("created_at");

                entity.HasIndex(r => r.RoleName).IsUnique();
            });

            // USER_ROLES configuration
            modelBuilder.Entity<UserRoleMapping>(entity =>
            {
                entity.ToTable("USER_ROLES");
                entity.HasKey(ur => ur.UserRoleId);
                entity.Property(ur => ur.UserRoleId).HasColumnName("user_role_id");
                entity.Property(ur => ur.UserId).HasColumnName("user_id");
                entity.Property(ur => ur.RoleId).HasColumnName("role_id");
                entity.Property(ur => ur.AssignedAt).HasColumnName("assigned_at");
                entity.Property(ur => ur.AssignedBy).HasColumnName("assigned_by");

                entity.HasIndex(ur => ur.UserId);
                entity.HasIndex(ur => ur.RoleId);
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

            // THERAPISTS configuration
            modelBuilder.Entity<Therapist>(entity =>
            {
                entity.ToTable("THERAPISTS");
                entity.HasKey(t => t.TherapistId);
                entity.Property(t => t.TherapistId).HasColumnName("therapist_id");
                entity.Property(t => t.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(t => t.Specialization).HasColumnName("specialization").HasMaxLength(200).IsRequired();
                entity.Property(t => t.Bio).HasColumnName("bio").HasMaxLength(1000);
                entity.Property(t => t.ExperienceYears).HasColumnName("experience_years");
                entity.Property(t => t.HourlyRate).HasColumnName("hourly_rate").HasColumnType("decimal(18,2)");
                entity.Property(t => t.Rating).HasColumnName("rating").HasColumnType("decimal(3,2)");
                entity.Property(t => t.Qualifications).HasColumnName("qualifications").HasMaxLength(1000);
                entity.Property(t => t.CreatedAt).HasColumnName("created_at");
                entity.Property(t => t.UpdatedAt).HasColumnName("updated_at");

                entity.HasIndex(t => t.UserId).IsUnique();

                entity.HasOne(t => t.User)
                    .WithOne(u => u.Therapist)
                    .HasForeignKey<Therapist>(t => t.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // PATIENTS configuration
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.ToTable("PATIENTS");
                entity.HasKey(p => p.PatientId);
                entity.Property(p => p.PatientId).HasColumnName("patient_id");
                entity.Property(p => p.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(p => p.EmergencyContactName).HasColumnName("emergency_contact_name").HasMaxLength(200);
                entity.Property(p => p.EmergencyContactPhone).HasColumnName("emergency_contact_phone").HasMaxLength(20);
                entity.Property(p => p.MedicalHistory).HasColumnName("medical_history").HasMaxLength(2000);
                entity.Property(p => p.Notes).HasColumnName("notes").HasMaxLength(2000);
                entity.Property(p => p.CreatedAt).HasColumnName("created_at");
                entity.Property(p => p.UpdatedAt).HasColumnName("updated_at");

                entity.HasIndex(p => p.UserId).IsUnique();

                entity.HasOne(p => p.User)
                    .WithOne(u => u.Patient)
                    .HasForeignKey<Patient>(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ASSESSMENTS configuration
            modelBuilder.Entity<Assessment>(entity =>
            {
                entity.ToTable("ASSESSMENTS");
                entity.HasKey(a => a.AssessmentId);
                entity.Property(a => a.AssessmentId).HasColumnName("assessment_id");
                entity.Property(a => a.PatientId).HasColumnName("patient_id").IsRequired();
                entity.Property(a => a.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
                entity.Property(a => a.AnswersJson).HasColumnName("answers_json").IsRequired();
                entity.Property(a => a.Score).HasColumnName("score");
                entity.Property(a => a.CompletedAt).HasColumnName("completed_at");

                entity.HasOne(a => a.Patient)
                    .WithMany(p => p.Assessments)
                    .HasForeignKey(a => a.PatientId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}