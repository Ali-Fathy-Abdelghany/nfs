using MongoDB.Driver;
using NFS.Application.Interfaces.Repositories;
using NFS.Chat.Models;

namespace NFS.Chat.Repositories;

public class TherapistReviewRepository : ITherapistReviewRepository
{
    private readonly IMongoCollection<TherapistReview> _reviews;

    public TherapistReviewRepository(IMongoDatabase database)
    {
        _reviews = database.GetCollection<TherapistReview>("TherapistReviews");
        var index = Builders<TherapistReview>.IndexKeys
            .Ascending(r => r.TherapistId)
            .Descending(r => r.CreatedAt);
        _reviews.Indexes.CreateOne(new CreateIndexModel<TherapistReview>(index));

        var uniquePatientTherapist = Builders<TherapistReview>.IndexKeys
            .Ascending(r => r.TherapistId)
            .Ascending(r => r.PatientId);
        _reviews.Indexes.CreateOne(new CreateIndexModel<TherapistReview>(
            uniquePatientTherapist,
            new CreateIndexOptions { Unique = true, Name = "ux_therapist_patient" }));
    }

    public async Task<IReadOnlyList<TherapistReviewRecord>> GetByTherapistIdAsync(int therapistId, int? limit = null)
    {
        var query = _reviews.Find(r => r.TherapistId == therapistId)
            .SortByDescending(r => r.CreatedAt);

        var list = limit.HasValue
            ? await query.Limit(limit.Value).ToListAsync()
            : await query.ToListAsync();

        return list.Select(Map).ToList();
    }

    public async Task<TherapistReviewRecord?> GetByIdAsync(string reviewId)
    {
        var doc = await _reviews.Find(r => r.Id == reviewId).FirstOrDefaultAsync();
        return doc == null ? null : Map(doc);
    }

    public async Task<TherapistReviewRecord?> GetByPatientAndTherapistAsync(int patientId, int therapistId)
    {
        var doc = await _reviews
            .Find(r => r.PatientId == patientId && r.TherapistId == therapistId)
            .FirstOrDefaultAsync();
        return doc == null ? null : Map(doc);
    }

    public async Task<TherapistReviewRecord> AddAsync(TherapistReviewRecord review)
    {
        var doc = new TherapistReview
        {
            TherapistId = review.TherapistId,
            PatientId = review.PatientId,
            UserId = review.UserId,
            AuthorName = review.AuthorName,
            Stars = review.Stars,
            Comment = review.Comment,
            IsAnonymous = review.IsAnonymous,
            AppointmentId = review.AppointmentId,
            CreatedAt = review.CreatedAt == default ? DateTime.UtcNow : review.CreatedAt
        };

        await _reviews.InsertOneAsync(doc);
        return Map(doc);
    }

    public async Task<bool> DeleteAsync(string reviewId)
    {
        var result = await _reviews.DeleteOneAsync(r => r.Id == reviewId);
        return result.DeletedCount > 0;
    }

    public async Task<(decimal Average, int Count)> GetAggregateAsync(int therapistId)
    {
        var list = await _reviews.Find(r => r.TherapistId == therapistId).ToListAsync();
        if (list.Count == 0) return (0m, 0);
        var avg = (decimal)list.Average(r => r.Stars);
        return (Math.Round(avg, 1), list.Count);
    }

    public async Task<IDictionary<int, int>> GetCountsAsync(IEnumerable<int> therapistIds)
    {
        var ids = therapistIds.Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<int, int>();

        var list = await _reviews.Find(r => ids.Contains(r.TherapistId)).ToListAsync();
        return list.GroupBy(r => r.TherapistId).ToDictionary(g => g.Key, g => g.Count());
    }

    private static TherapistReviewRecord Map(TherapistReview r) => new()
    {
        Id = r.Id,
        TherapistId = r.TherapistId,
        PatientId = r.PatientId,
        UserId = r.UserId,
        AuthorName = r.AuthorName,
        Stars = r.Stars,
        Comment = r.Comment,
        IsAnonymous = r.IsAnonymous,
        AppointmentId = r.AppointmentId,
        CreatedAt = r.CreatedAt
    };
}
