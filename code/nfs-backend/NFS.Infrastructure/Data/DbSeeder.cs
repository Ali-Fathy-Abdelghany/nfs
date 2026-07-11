using Microsoft.EntityFrameworkCore;
using NFS.Domain.Entities;
using NFS.Application.Helpers;

namespace NFS.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // Apply pending migrations without dropping the database
            await context.Database.MigrateAsync();

            if (!await context.Roles.AnyAsync())
            {
                context.Roles.AddRange(
                    new Role { RoleName = "CLIENT", Description = "Patient client role" },
                    new Role { RoleName = "THERAPIST", Description = "Therapist role" },
                    new Role { RoleName = "ADMIN", Description = "Administrator role" }
                );
                await context.SaveChangesAsync();
            }

            // Only skip full user seed if both users and appointments already exist
            if (await context.Users.AnyAsync() && await context.Appointments.AnyAsync())
            {
                await EnsureTestAvailabilitySlotsAsync(context);
                return;
            }

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

            context.AvailabilitySlots.AddRange(CreateTestSlots(therapist.TherapistId, DateTime.UtcNow));
            await context.SaveChangesAsync();

            // ---- Seed Reservations (Appointments + Sessions) ----
            var firstSlot = await context.AvailabilitySlots
                .Where(s => s.DoctorId == therapist.TherapistId)
                .OrderBy(s => s.StartTime)
                .FirstAsync();

            var appointment = new Appointment
            {
                PatientId = patient.PatientId,
                DoctorId = therapist.TherapistId,
                SlotId = firstSlot.Id,
                Status = "Confirmed",
                CreatedAt = DateTime.UtcNow
            };
            context.Appointments.Add(appointment);
            await context.SaveChangesAsync();

            // Mark the slot as booked.
            var slot = await context.AvailabilitySlots.FindAsync(appointment.SlotId);
            if (slot != null)
                slot.IsBooked = true;
            // Persist the slot change before creating the session
            await context.SaveChangesAsync();

            // Create a corresponding session for the appointment.
            var session = new Session
            {
                AppointmentId = appointment.Id,
                ActualStartTime = null,
                ActualEndTime = null,
                MeetingLink = "https://meet.example.com/12345",
                Status = "Scheduled"
            };
            context.Sessions.Add(session);
            await context.SaveChangesAsync();

            await EnsureTestAvailabilitySlotsAsync(context);
        }

        private static List<AvailabilitySlot> CreateTestSlots(int doctorId, DateTime fromUtc)
        {
            var slots = new List<AvailabilitySlot>();
            var testHours = new[] { 9, 11, 14, 16, 18 };

            for (var day = 1; day <= 7; day++)
            {
                foreach (var hour in testHours)
                {
                    var start = fromUtc.Date.AddDays(day).AddHours(hour);
                    slots.Add(new AvailabilitySlot
                    {
                        DoctorId = doctorId,
                        StartTime = start,
                        EndTime = start.AddHours(1),
                        IsBooked = false
                    });
                }
            }

            return slots;
        }

        /// <summary>
        /// Ensures each therapist has free availability slots for booking tests.
        /// Safe to run on every startup — skips duplicates and already-booked times.
        /// </summary>
        private static async Task EnsureTestAvailabilitySlotsAsync(ApplicationDbContext context)
        {
            var therapists = await context.Therapists.ToListAsync();
            if (therapists.Count == 0)
                return;

            var now = DateTime.UtcNow;
            var slotsToAdd = new List<AvailabilitySlot>();
            var testHours = new[] { 9, 11, 14, 16, 18 };

            foreach (var therapist in therapists)
            {
                var unbookedCount = await context.AvailabilitySlots
                    .CountAsync(s => s.DoctorId == therapist.TherapistId && !s.IsBooked);

                if (unbookedCount >= 12)
                    continue;

                for (var day = 0; day < 14; day++)
                {
                    foreach (var hour in testHours)
                    {
                        var start = now.Date.AddDays(day).AddHours(hour);
                        if (start <= now)
                            continue;

                        var end = start.AddHours(1);
                        var exists = await context.AvailabilitySlots.AnyAsync(s =>
                            s.DoctorId == therapist.TherapistId && s.StartTime == start);

                        if (exists)
                            continue;

                        slotsToAdd.Add(new AvailabilitySlot
                        {
                            DoctorId = therapist.TherapistId,
                            StartTime = start,
                            EndTime = end,
                            IsBooked = false
                        });
                    }
                }
            }

            if (slotsToAdd.Count == 0)
                return;

            context.AvailabilitySlots.AddRange(slotsToAdd);
            await context.SaveChangesAsync();
        }
    }
}
