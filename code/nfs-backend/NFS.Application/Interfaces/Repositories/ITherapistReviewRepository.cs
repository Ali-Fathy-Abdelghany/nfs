namespace NFS.Application.Interfaces.Repositories;

public interface ITherapistReviewRepository
{
    Task<IReadOnlyList<TherapistReviewRecord>> GetByTherapistIdAsync(int therapistId, int? limit = null);
    Task<TherapistReviewRecord?> GetByIdAsync(string reviewId);
    Task<TherapistReviewRecord?> GetByPatientAndTherapistAsync(int patientId, int therapistId);
    Task<TherapistReviewRecord> AddAsync(TherapistReviewRecord review);
    Task<bool> DeleteAsync(string reviewId);
    Task<(decimal Average, int Count)> GetAggregateAsync(int therapistId);
    Task<IDictionary<int, int>> GetCountsAsync(IEnumerable<int> therapistIds);
}

public class TherapistReviewRecord
{
    public string Id { get; set; } = string.Empty;
    public int TherapistId { get; set; }
    public int PatientId { get; set; }
    public int? UserId { get; set; }
    public string AuthorName { get; set; } = "مراجع";
    public int Stars { get; set; }
    public string Comment { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; } = true;
    public int? AppointmentId { get; set; }
    public DateTime CreatedAt { get; set; }
}
