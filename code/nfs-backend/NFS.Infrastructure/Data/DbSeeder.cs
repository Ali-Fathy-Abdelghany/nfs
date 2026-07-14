using Microsoft.EntityFrameworkCore;
using NFS.Domain.Entities;
using NFS.Domain.Enums;
using NFS.Application.Helpers;

namespace NFS.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            try
            {
                await context.Database.MigrateAsync();
            }
            catch (InvalidOperationException ex) when (
                ex.Message.Contains("PendingModelChangesWarning", StringComparison.Ordinal))
            {
                // Handwritten migrations sometimes lag the ModelSnapshot; schema is
                // still ensured below so local/dev startup can continue.
            }

            // Apply critical schema patches after migration so a fresh LocalDB
            // database can be created before raw SQL opens the connection.
            await EnsurePaymentsTableAsync(context);
            await EnsureTherapistAndReminderColumnsAsync(context);
            await EnsureExternalLoginsTableAsync(context);

            if (!await context.Roles.AnyAsync())
            {
                context.Roles.AddRange(
                    new Role { RoleName = "CLIENT", Description = "Patient client role" },
                    new Role { RoleName = "THERAPIST", Description = "Therapist role" },
                    new Role { RoleName = "ADMIN", Description = "Administrator role" }
                );
                await context.SaveChangesAsync();
            }

            await EnsureCoreUsersAndDoctorsAsync(context);
            await EnsureAdminUserAsync(context);
            await EnsureTestAvailabilitySlotsAsync(context);
            await EnsureSampleAppointmentsAsync(context);
        }

        /// <summary>
        /// Ensures Payments table exists even if the EF migration was not discovered
        /// (missing Designer / Migration attribute).
        /// </summary>
        private static async Task EnsurePaymentsTableAsync(ApplicationDbContext context)
        {
            await context.Database.ExecuteSqlRawAsync("""
                IF OBJECT_ID(N'Payments', N'U') IS NULL
                BEGIN
                    CREATE TABLE Payments (
                        Id INT IDENTITY(1,1) NOT NULL,
                        AppointmentId INT NULL,
                        PatientId INT NOT NULL,
                        DoctorId INT NULL,
                        Amount DECIMAL(18,2) NOT NULL,
                        Currency NVARCHAR(10) NOT NULL,
                        Status NVARCHAR(30) NOT NULL,
                        Provider NVARCHAR(50) NOT NULL,
                        ProviderReference NVARCHAR(200) NULL,
                        CheckoutUrl NVARCHAR(2000) NULL,
                        PlanType NVARCHAR(50) NULL,
                        ExtraAppointmentIds NVARCHAR(200) NULL,
                        CreatedAt DATETIME2 NOT NULL,
                        PaidAt DATETIME2 NULL,
                        CONSTRAINT PK_Payments PRIMARY KEY (Id),
                        CONSTRAINT FK_Payments_Patients_PatientId FOREIGN KEY (PatientId) REFERENCES Patients(PatientId) ON DELETE NO ACTION,
                        CONSTRAINT FK_Payments_Therapists_DoctorId FOREIGN KEY (DoctorId) REFERENCES Therapists(TherapistId) ON DELETE NO ACTION,
                        CONSTRAINT FK_Payments_Appointments_AppointmentId FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id) ON DELETE SET NULL
                    );
                    CREATE INDEX IX_Payments_PatientId ON Payments(PatientId);
                    CREATE INDEX IX_Payments_DoctorId ON Payments(DoctorId);
                    CREATE INDEX IX_Payments_AppointmentId ON Payments(AppointmentId);
                END
                ELSE
                BEGIN
                    -- Paymob unified checkout URLs exceed 500 chars
                    IF EXISTS (
                        SELECT 1 FROM sys.columns
                        WHERE object_id = OBJECT_ID(N'Payments') AND name = N'CheckoutUrl' AND max_length < 4000
                    )
                        ALTER TABLE Payments ALTER COLUMN CheckoutUrl NVARCHAR(2000) NULL;

                    IF COL_LENGTH(N'Payments', N'ExtraAppointmentIds') IS NULL
                        ALTER TABLE Payments ADD ExtraAppointmentIds NVARCHAR(200) NULL;
                END
                """);
        }

        /// <summary>
        /// Therapist Status/RejectionReason/VerifiedAt and Appointment.ReminderSentAt.
        /// Idempotent — safe if migrations already applied.
        /// </summary>
        private static async Task EnsureTherapistAndReminderColumnsAsync(ApplicationDbContext context)
        {
            // Separate batches: SQL Server compiles the whole batch before running, so
            // UPDATE ... Status fails if Status is added in the same batch.
            await context.Database.ExecuteSqlRawAsync("""
                IF COL_LENGTH(N'Therapists', N'Status') IS NULL
                    ALTER TABLE Therapists ADD Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Therapists_Status DEFAULT N'Pending';
                """);

            await context.Database.ExecuteSqlRawAsync("""
                IF COL_LENGTH(N'Therapists', N'RejectionReason') IS NULL
                    ALTER TABLE Therapists ADD RejectionReason NVARCHAR(1000) NULL;
                """);

            await context.Database.ExecuteSqlRawAsync("""
                IF COL_LENGTH(N'Therapists', N'VerifiedAt') IS NULL
                    ALTER TABLE Therapists ADD VerifiedAt DATETIME2 NULL;
                """);

            await context.Database.ExecuteSqlRawAsync("""
                IF COL_LENGTH(N'Appointments', N'ReminderSentAt') IS NULL
                    ALTER TABLE Appointments ADD ReminderSentAt DATETIME2 NULL;
                """);

            await context.Database.ExecuteSqlRawAsync("""
                UPDATE Therapists SET Status = N'Approved', VerifiedAt = ISNULL(UpdatedAt, CreatedAt)
                WHERE IsVerified = 1 AND (Status IS NULL OR Status = N'Pending' OR Status = N'0');

                UPDATE Therapists SET Status = N'Pending'
                WHERE IsVerified = 0 AND (Status IS NULL OR Status = N'0' OR Status = N'');
                """);
        }

        private static async Task EnsureExternalLoginsTableAsync(ApplicationDbContext context)
        {
            await context.Database.ExecuteSqlRawAsync("""
                IF OBJECT_ID(N'ExternalLogins', N'U') IS NULL
                BEGIN
                    CREATE TABLE ExternalLogins (
                        ExternalLoginId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ExternalLogins PRIMARY KEY,
                        Provider NVARCHAR(64) NOT NULL,
                        ProviderKey NVARCHAR(256) NOT NULL,
                        UserId INT NOT NULL,
                        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ExternalLogins_CreatedAt DEFAULT (SYSUTCDATETIME()),
                        CONSTRAINT FK_ExternalLogins_Users_UserId
                            FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
                    );

                    CREATE UNIQUE INDEX IX_ExternalLogins_Provider_ProviderKey
                        ON ExternalLogins (Provider, ProviderKey);
                END
                """);
        }

        private static async Task EnsureAdminUserAsync(ApplicationDbContext context)
        {
            var adminRole = await context.Roles.FirstAsync(r => r.RoleName == "ADMIN");
            var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@test.com");
            if (adminUser == null)
            {
                adminUser = new User
                {
                    FirstName = "Admin",
                    LastName = "Nafs",
                    Email = "admin@test.com",
                    PasswordHash = PasswordHelper.HashPassword("Password123!"),
                    Phone = "01000000000",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
                context.UserRoles.Add(new UserRoleMapping
                {
                    UserId = adminUser.UserId,
                    RoleId = adminRole.RoleId,
                    AssignedAt = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }
            else if (!await context.UserRoles.AnyAsync(ur => ur.UserId == adminUser.UserId && ur.RoleId == adminRole.RoleId))
            {
                context.UserRoles.Add(new UserRoleMapping
                {
                    UserId = adminUser.UserId,
                    RoleId = adminRole.RoleId,
                    AssignedAt = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }

            // One pending therapist for admin approval testing
            var pendingEmail = "pending.doctor@test.com";
            var pendingUser = await context.Users.FirstOrDefaultAsync(u => u.Email == pendingEmail);
            if (pendingUser == null)
            {
                var therapistRole = await context.Roles.FirstAsync(r => r.RoleName == "THERAPIST");
                pendingUser = new User
                {
                    FirstName = "هبة",
                    LastName = "نادر",
                    Email = pendingEmail,
                    PasswordHash = PasswordHelper.HashPassword("Password123!"),
                    Phone = "01077778888",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                context.Users.Add(pendingUser);
                await context.SaveChangesAsync();
                context.UserRoles.Add(new UserRoleMapping
                {
                    UserId = pendingUser.UserId,
                    RoleId = therapistRole.RoleId,
                    AssignedAt = DateTime.UtcNow
                });
                context.Therapists.Add(new Therapist
                {
                    UserId = pendingUser.UserId,
                    Specialization = "العلاج المعرفي السلوكي",
                    Bio = "معالجة جديدة بانتظار موافقة الإدارة للانضمام إلى المنصة.",
                    ExperienceYears = 3,
                    HourlyRate = 200,
                    Rating = 0,
                    Qualifications = "ماجستير علم نفس عيادي, ترخيص قيد المراجعة",
                    IsVerified = false,
                    CreatedAt = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }
        }

        private static async Task EnsureCoreUsersAndDoctorsAsync(ApplicationDbContext context)
        {
            var clientRole = await context.Roles.FirstAsync(r => r.RoleName == "CLIENT");
            var therapistRole = await context.Roles.FirstAsync(r => r.RoleName == "THERAPIST");

            // ---- Patient ----
            var patientUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "patient@test.com");
            if (patientUser == null)
            {
                patientUser = new User
                {
                    FirstName = "نور",
                    LastName = "حسن",
                    Email = "patient@test.com",
                    PasswordHash = PasswordHelper.HashPassword("Password123!"),
                    Phone = "01001234567",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                context.Users.Add(patientUser);
                await context.SaveChangesAsync();
                context.UserRoles.Add(new UserRoleMapping
                {
                    UserId = patientUser.UserId,
                    RoleId = clientRole.RoleId,
                    AssignedAt = DateTime.UtcNow
                });
            }

            var patient = await context.Patients.FirstOrDefaultAsync(p => p.UserId == patientUser.UserId);
            if (patient == null)
            {
                patient = new Patient
                {
                    UserId = patientUser.UserId,
                    EmergencyContactName = "أحمد حسن",
                    EmergencyContactPhone = "01009876543",
                    MedicalHistory = "قلق, توتر مزمن",
                    Notes = "متابعة أسبوعية للعلاج السلوكي",
                    CreatedAt = DateTime.UtcNow
                };
                context.Patients.Add(patient);
                await context.SaveChangesAsync();
            }

            // Extra patients for richer doctor timeline
            await EnsureExtraPatientsAsync(context, clientRole.RoleId);

            // ---- Therapists ----
            foreach (var spec in GetDoctorSeedSpecs())
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Email == spec.Email);
                if (user == null)
                {
                    user = new User
                    {
                        FirstName = spec.FirstName,
                        LastName = spec.LastName,
                        Email = spec.Email,
                        PasswordHash = PasswordHelper.HashPassword("Password123!"),
                        Phone = spec.Phone,
                        ProfileImageUrl = spec.ImageUrl,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Users.Add(user);
                    await context.SaveChangesAsync();
                    context.UserRoles.Add(new UserRoleMapping
                    {
                        UserId = user.UserId,
                        RoleId = therapistRole.RoleId,
                        AssignedAt = DateTime.UtcNow
                    });
                }

                var therapist = await context.Therapists.FirstOrDefaultAsync(t => t.UserId == user.UserId);
                if (therapist == null)
                {
                    therapist = new Therapist
                    {
                        UserId = user.UserId,
                        Specialization = spec.Specialization,
                        Bio = spec.Bio,
                        ExperienceYears = spec.ExperienceYears,
                        HourlyRate = spec.HourlyRate,
                        Rating = spec.Rating,
                        Qualifications = spec.Qualifications,
                        IsVerified = true,
                        Status = TherapistStatus.Approved,
                        VerifiedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Therapists.Add(therapist);
                    await context.SaveChangesAsync();
                }
            }
        }

        private static async Task EnsureExtraPatientsAsync(ApplicationDbContext context, int clientRoleId)
        {
            var extras = new[]
            {
                ("patient2@test.com", "سارة", "علي", "قلق اجتماعي"),
                ("patient3@test.com", "كريم", "محمود", "أرق, ضغط عمل"),
            };

            foreach (var (email, first, last, notes) in extras)
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    user = new User
                    {
                        FirstName = first,
                        LastName = last,
                        Email = email,
                        PasswordHash = PasswordHelper.HashPassword("Password123!"),
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Users.Add(user);
                    await context.SaveChangesAsync();
                    context.UserRoles.Add(new UserRoleMapping
                    {
                        UserId = user.UserId,
                        RoleId = clientRoleId,
                        AssignedAt = DateTime.UtcNow
                    });
                }

                if (!await context.Patients.AnyAsync(p => p.UserId == user.UserId))
                {
                    context.Patients.Add(new Patient
                    {
                        UserId = user.UserId,
                        Notes = notes,
                        MedicalHistory = notes,
                        CreatedAt = DateTime.UtcNow
                    });
                    await context.SaveChangesAsync();
                }
            }
        }

        private sealed record DoctorSeedSpec(
            string Email,
            string FirstName,
            string LastName,
            string Phone,
            string Specialization,
            string Bio,
            int ExperienceYears,
            decimal HourlyRate,
            decimal Rating,
            string Qualifications,
            string? ImageUrl,
            int[] WorkDays,   // DayOfWeek as int, 0=Sunday
            int[] MorningHours,
            int[] AfternoonHours
        );

        private static List<DoctorSeedSpec> GetDoctorSeedSpecs() =>
        [
            new(
                "therapist@test.com",
                "سارة",
                "الأحمد",
                "01011112222",
                "العلاج السلوكي المعرفي (CBT)",
                "أؤمن بأن الرحلة نحو الشفاء تبدأ من خلق مساحة آمنة ومقبولة تماماً. أساعد العملاء على فهم أنماط التفكير وإعادة بنائها بلطف.",
                12,
                350,
                4.9m,
                "دكتوراة في علم النفس العيادي, شهادة معتمدة في العلاج المعرفي CBT, العلاج الزواجي",
                null,
                [0, 1, 2, 3, 4], // Sun–Thu
                [9, 10, 11],
                [14, 15, 16]
            ),
            new(
                "therapist2@test.com",
                "أحمد",
                "المنصوري",
                "01022223333",
                "العلاج الأسري والعلاقات",
                "متخصص في ديناميكيات الأسرة والتواصل الزوجي، مع أسلوب عملي يركز على حلول قابلة للتطبيق في الحياة اليومية.",
                8,
                280,
                4.7m,
                "ماجستير إرشاد أسري, دبلوم علاج الأزواج, خبرة عيادية في المراكز المجتمعية",
                null,
                [0, 1, 2, 3], // Sun–Wed
                [10, 11],
                [16, 17, 18]
            ),
            new(
                "therapist3@test.com",
                "ليلى",
                "فؤاد",
                "01033334444",
                "علم نفس الطفل والمراهق",
                "أعمل مع الأطفال والمراهقين وأولياء أمورهم لبناء ثقة وتنظيم عاطفي في بيئة داعمة وغير حكمية.",
                10,
                320,
                4.8m,
                "دكتوراة علم نفس نمو, شهادة لعب علاجي, تدريب اضطراب فرط الحركة ونقص الانتباه",
                null,
                [1, 2, 3, 4], // Mon–Thu
                [9, 10],
                [13, 14, 15]
            ),
            new(
                "therapist4@test.com",
                "يوسف",
                "خالد",
                "01044445555",
                "الصحة النفسية في بيئة العمل",
                "أساعد المهنيين على إدارة الاحتراق الوظيفي والقلق المرتبط بالعمل واستعادة التوازن بين الحياة والعمل.",
                6,
                250,
                4.6m,
                "ماجستير علم نفس تنظيمي, شهادة إدارة الإجهاد, كوتش معتمد",
                null,
                [0, 1, 2, 3, 4],
                [8, 9],
                [17, 18, 19]
            ),
            new(
                "therapist5@test.com",
                "منى",
                "سعيد",
                "01055556666",
                "علاج الصدمات والقلق",
                "نهج لطيف مبني على الأدلة لعلاج اضطراب ما بعد الصدمة ونوبات القلق، مع احترام إيقاع كل شخص.",
                15,
                400,
                4.95m,
                "دكتوراة علم نفس عيادي, شهادة EMDR, علاج التعرض المطول",
                null,
                [0, 2, 4], // Sun, Tue, Thu
                [11, 12],
                [15, 16]
            ),
        ];

        /// <summary>
        /// Ensures each therapist has ~15–20 free slots for booking tests.
        /// Caps growth and trims excess free slots on startup.
        /// </summary>
        private static async Task EnsureTestAvailabilitySlotsAsync(ApplicationDbContext context)
        {
            const int targetFreeSlots = 18;

            var therapists = await context.Therapists.Include(t => t.User).ToListAsync();
            if (therapists.Count == 0)
                return;

            var specsByEmail = GetDoctorSeedSpecs().ToDictionary(s => s.Email, StringComparer.OrdinalIgnoreCase);
            var now = DateTime.UtcNow;
            var slotsToAdd = new List<AvailabilitySlot>();

            foreach (var therapist in therapists)
            {
                var freeCount = await context.AvailabilitySlots
                    .CountAsync(s => s.DoctorId == therapist.TherapistId && !s.IsBooked && s.StartTime > now);

                if (freeCount > 20)
                {
                    var referencedSlotIds = context.Appointments.Select(a => a.SlotId);
                    var excess = await context.AvailabilitySlots
                        .Where(s =>
                            s.DoctorId == therapist.TherapistId
                            && !s.IsBooked
                            && s.StartTime > now
                            && !referencedSlotIds.Contains(s.Id))
                        .OrderByDescending(s => s.StartTime)
                        .Skip(18)
                        .ToListAsync();
                    if (excess.Count > 0)
                    {
                        context.AvailabilitySlots.RemoveRange(excess);
                        await context.SaveChangesAsync();
                        freeCount = await context.AvailabilitySlots
                            .CountAsync(s => s.DoctorId == therapist.TherapistId && !s.IsBooked && s.StartTime > now);
                    }
                }

                if (freeCount >= targetFreeSlots)
                    continue;

                var email = therapist.User?.Email ?? "";
                specsByEmail.TryGetValue(email, out var spec);

                var workDays = spec?.WorkDays ?? [0, 1, 2, 3, 4];
                var morning = (spec?.MorningHours ?? [9, 10, 11]).Take(2).ToArray();
                var afternoon = (spec?.AfternoonHours ?? [14, 15, 16]).Take(1).ToArray();
                var hours = morning.Concat(afternoon).Distinct().OrderBy(h => h).ToArray();

                var needed = targetFreeSlots - freeCount;
                var addedForDoctor = 0;

                for (var day = 0; day < 21 && addedForDoctor < needed; day++)
                {
                    var date = now.Date.AddDays(day);
                    var dow = (int)date.DayOfWeek;
                    if (!workDays.Contains(dow))
                        continue;

                    foreach (var hour in hours)
                    {
                        if (addedForDoctor >= needed)
                            break;

                        var start = DateTime.SpecifyKind(date.AddHours(hour), DateTimeKind.Unspecified);
                        if (DateTime.SpecifyKind(now, DateTimeKind.Unspecified) >= start)
                            continue;

                        var end = start.AddMinutes(50);
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
                        addedForDoctor++;
                    }
                }
            }

            if (slotsToAdd.Count == 0)
                return;

            context.AvailabilitySlots.AddRange(slotsToAdd);
            await context.SaveChangesAsync();
        }

        /// <summary>
        /// Seeds a few confirmed + pending appointments so the doctor timetable has real data.
        /// </summary>
        private static async Task EnsureSampleAppointmentsAsync(ApplicationDbContext context)
        {
            if (await context.Appointments.CountAsync() >= 3)
                return;

            var mainTherapist = await context.Therapists
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.User!.Email == "therapist@test.com");
            if (mainTherapist == null)
                return;

            var patients = await context.Patients.Include(p => p.User).Take(3).ToListAsync();
            if (patients.Count == 0)
                return;

            var freeSlots = await context.AvailabilitySlots
                .Where(s => s.DoctorId == mainTherapist.TherapistId && !s.IsBooked && s.StartTime > DateTime.UtcNow)
                .OrderBy(s => s.StartTime)
                .Take(4)
                .ToListAsync();

            if (freeSlots.Count == 0)
                return;

            // Confirmed upcoming
            await BookSlotAsync(context, patients[0].PatientId, mainTherapist.TherapistId, freeSlots[0], "Confirmed", withSession: true);

            // Pending request
            if (freeSlots.Count > 1 && patients.Count > 1)
                await BookSlotAsync(context, patients[1].PatientId, mainTherapist.TherapistId, freeSlots[1], "Pending", withSession: false);

            // Another pending
            if (freeSlots.Count > 2 && patients.Count > 2)
                await BookSlotAsync(context, patients[2].PatientId, mainTherapist.TherapistId, freeSlots[2], "Pending", withSession: false);

            // Second doctor gets one confirmed booking too
            var second = await context.Therapists
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.User!.Email == "therapist2@test.com");
            if (second != null)
            {
                var slot = await context.AvailabilitySlots
                    .Where(s => s.DoctorId == second.TherapistId && !s.IsBooked && s.StartTime > DateTime.UtcNow)
                    .OrderBy(s => s.StartTime)
                    .FirstOrDefaultAsync();
                if (slot != null)
                    await BookSlotAsync(context, patients[0].PatientId, second.TherapistId, slot, "Confirmed", withSession: true);
            }
        }

        private static async Task BookSlotAsync(
            ApplicationDbContext context,
            int patientId,
            int doctorId,
            AvailabilitySlot slot,
            string status,
            bool withSession)
        {
            var already = await context.Appointments.AnyAsync(a => a.SlotId == slot.Id);
            if (already)
                return;

            var appointment = new Appointment
            {
                PatientId = patientId,
                DoctorId = doctorId,
                SlotId = slot.Id,
                Status = status,
                CreatedAt = DateTime.UtcNow
            };
            context.Appointments.Add(appointment);
            slot.IsBooked = true;
            await context.SaveChangesAsync();

            if (withSession)
            {
                context.Sessions.Add(new Session
                {
                    AppointmentId = appointment.Id,
                    MeetingLink = "https://meet.example.com/" + appointment.Id,
                    Status = "Scheduled"
                });
                await context.SaveChangesAsync();
            }
        }
    }
}
