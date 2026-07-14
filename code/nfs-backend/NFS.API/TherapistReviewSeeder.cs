using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using NFS.Application.Interfaces.Data;
using NFS.Application.Interfaces.Repositories;
using NFS.Chat.Models;

public static class TherapistReviewSeeder
{
    public static async Task SeedAsync(IMongoDatabase database, IApplicationDbContext db, ITherapistReviewRepository reviews)
    {
        var collection = database.GetCollection<TherapistReview>("TherapistReviews");
        var existing = await collection.CountDocumentsAsync(FilterDefinition<TherapistReview>.Empty);
        if (existing > 0)
        {
            Console.WriteLine("[TherapistReviewSeeder] Reviews already present — skipping.");
            return;
        }

        var therapists = await db.Therapists
            .Include(t => t.User)
            .Where(t => t.IsVerified)
            .OrderBy(t => t.TherapistId)
            .Take(5)
            .ToListAsync();

        var patients = await db.Patients
            .Include(p => p.User)
            .OrderBy(p => p.PatientId)
            .Take(3)
            .ToListAsync();

        if (therapists.Count == 0 || patients.Count == 0)
        {
            Console.WriteLine("[TherapistReviewSeeder] No therapists/patients to seed reviews.");
            return;
        }

        var samples = new (int Stars, string Comment)[]
        {
            (5, "تجربة احترافية ومريحة. أسلوب المعالج ساعدني أشعر أنني مفهوم لأول مرة."),
            (4, "جلسات منظمة ومثمرة. أنصح بها لمن يبحث عن دعم نفسي جاد."),
            (5, "ساعدتني كثيراً في التعامل مع نوبات القلق. بيئة آمنة وداعمة."),
            (5, "استماع حقيقي وتعاطف كبير. أشعر أنني في أيدٍ أمينة."),
            (4, "تحسّن ملحوظ في جودة نومي بعد بضع جلسات فقط."),
        };

        var created = 0;
        for (var i = 0; i < therapists.Count; i++)
        {
            var therapist = therapists[i];
            var reviewCount = Math.Min(3, samples.Length);
            for (var j = 0; j < reviewCount; j++)
            {
                var patient = patients[j % patients.Count];
                var sample = samples[(i + j) % samples.Length];
                var name = $"{patient.User?.FirstName} {patient.User?.LastName}".Trim();
                if (string.IsNullOrWhiteSpace(name)) name = "مراجع";

                await reviews.AddAsync(new TherapistReviewRecord
                {
                    TherapistId = therapist.TherapistId,
                    PatientId = patient.PatientId,
                    UserId = patient.UserId,
                    AuthorName = name,
                    Stars = sample.Stars,
                    Comment = sample.Comment,
                    IsAnonymous = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-(i * 7 + j * 3))
                });
                created++;
            }

            var (average, _) = await reviews.GetAggregateAsync(therapist.TherapistId);
            therapist.Rating = average;
            therapist.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
        Console.WriteLine($"[TherapistReviewSeeder] ✅ Seeded {created} reviews into MongoDB and synced SQL ratings.");
    }
}
