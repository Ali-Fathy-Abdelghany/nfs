using System;
using System.Collections.Generic;

namespace nfs.Application.DTOs
{
    public class TherapistRegistrationDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Phone { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
        public required string LicenseNumber { get; set; }
        public required DateTime LicenseIssueDate { get; set; }
        public required DateTime LicenseExpiryDate { get; set; }
        public required int YearsOfExperience { get; set; }
        public string? Bio { get; set; }
        public string? Qualifications { get; set; }
        public string? OfficeAddress { get; set; }
        public string? OfficePhone { get; set; }
        public required decimal HourlyRate { get; set; }
        public string? Languages { get; set; }
        public List<int>? SpecializationIds { get; set; }
    }

    public class TherapistProfileDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string LicenseNumber { get; set; }
        public DateTime LicenseIssueDate { get; set; }
        public DateTime LicenseExpiryDate { get; set; }
        public string VerificationStatus { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public int YearsOfExperience { get; set; }
        public string? Bio { get; set; }
        public string? Qualifications { get; set; }
        public bool IsAvailable { get; set; }
        public string? OfficeAddress { get; set; }
        public string? OfficePhone { get; set; }
        public decimal HourlyRate { get; set; }
        public string? Languages { get; set; }
        public List<SpecializationDto> Specializations { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class TherapistSearchDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int YearsOfExperience { get; set; }
        public string? Bio { get; set; }
        public bool IsAvailable { get; set; }
        public decimal HourlyRate { get; set; }
        public string? Languages { get; set; }
        public List<SpecializationDto> Specializations { get; set; } = new();
        public double? Rating { get; set; }
    }

    public class TherapistUpdateProfileDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Bio { get; set; }
        public string? Qualifications { get; set; }
        public bool? IsAvailable { get; set; }
        public string? OfficeAddress { get; set; }
        public string? OfficePhone { get; set; }
        public decimal? HourlyRate { get; set; }
        public string? Languages { get; set; }
        public List<int>? SpecializationIds { get; set; }
    }

    public class TherapistApprovalDto
    {
        public int TherapistId { get; set; }
        public bool IsApproved { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class SpecializationDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public int YearsOfExperienceInSpecialization { get; set; }
    }
}
