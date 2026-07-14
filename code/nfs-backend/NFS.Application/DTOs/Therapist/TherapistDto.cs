using System;

namespace NFS.Application.DTOs
{
    public class TherapistDto
    {
        public int TherapistId { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string Specialization { get; set; } = null!;
        public string? Bio { get; set; }
        public int ExperienceYears { get; set; }
        public decimal HourlyRate { get; set; }
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
        public string? Qualifications { get; set; }
        public bool IsVerified { get; set; }
        /// <summary>Pending | Approved | Rejected | Suspended | Inactive</summary>
        public string Status { get; set; } = "Pending";
        public string? RejectionReason { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public string? Country { get; set; }
        public string? Governorate { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
