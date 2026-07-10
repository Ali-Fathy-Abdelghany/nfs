using Microsoft.EntityFrameworkCore;
using NFS.Domain.Entities;
using NFS.Application.Helpers;

namespace NFS.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            await context.Database.EnsureCreatedAsync();

            if (!await context.Roles.AnyAsync())
            {
                context.Roles.AddRange(
                    new Role { RoleName = "CLIENT", Description = "Patient client role" },
                    new Role { RoleName = "THERAPIST", Description = "Therapist role" },
                    new Role { RoleName = "ADMIN", Description = "Administrator role" }
                );
                await context.SaveChangesAsync();
            }

            if (await context.Users.AnyAsync())
                return;

            var clientRole = await context.Roles.FirstAsync(r => r.RoleName == "CLIENT");
            var therapistRole = await context.Roles.FirstAsync(r => r.RoleName == "THERAPIST");

            var patientUser = new User
            {
                FirstName = "Test",
                LastName = "Patient",
                Email = "patient@test.com",
                PasswordHash = PasswordHelper.HashPassword("Password123!"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var therapistUser = new User
            {
                FirstName = "Test",
                LastName = "Therapist",
                Email = "therapist@test.com",
                PasswordHash = PasswordHelper.HashPassword("Password123!"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(patientUser, therapistUser);
            await context.SaveChangesAsync();

            context.UserRoles.AddRange(
                new UserRoleMapping { UserId = patientUser.UserId, RoleId = clientRole.RoleId, AssignedAt = DateTime.UtcNow },
                new UserRoleMapping { UserId = therapistUser.UserId, RoleId = therapistRole.RoleId, AssignedAt = DateTime.UtcNow }
            );

            var patient = new Patient
            {
                UserId = patientUser.UserId,
                EmergencyContactName = "Emergency Contact",
                EmergencyContactPhone = "1234567890",
                CreatedAt = DateTime.UtcNow
            };

            var therapist = new Therapist
            {
                UserId = therapistUser.UserId,
                Specialization = "Clinical Psychology",
                Bio = "Experienced therapist",
                ExperienceYears = 5,
                HourlyRate = 100,
                Rating = 4.5m,
                IsVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Patients.Add(patient);
            context.Therapists.Add(therapist);
            await context.SaveChangesAsync();

            context.AvailabilitySlots.Add(new AvailabilitySlot
            {
                DoctorId = therapist.TherapistId,
                StartTime = DateTime.UtcNow.AddDays(1),
                EndTime = DateTime.UtcNow.AddDays(1).AddHours(1),
                IsBooked = false
            });

            await context.SaveChangesAsync();
        }
    }
}
