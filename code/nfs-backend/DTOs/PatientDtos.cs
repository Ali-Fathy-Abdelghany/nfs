using System;
using System.Collections.Generic;

namespace nfs.Application.DTOs
{
    public class PatientProfileDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string? BloodType { get; set; }
        public string? MedicalConditions { get; set; }
        public string? CurrentMedications { get; set; }
        public string? Allergies { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? EmergencyContactRelation { get; set; }
        public bool HasInsurance { get; set; }
        public string? InsuranceProvider { get; set; }
        public string? InsurancePolicyNumber { get; set; }
        public string? PrimaryConcern { get; set; }
        public string? MentalHealthHistory { get; set; }
        public string? FamilyMentalHealthHistory { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class PatientRegistrationDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Phone { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
        public string? BloodType { get; set; }
        public string? MedicalConditions { get; set; }
        public string? PrimaryConcern { get; set; }
        public string? MentalHealthHistory { get; set; }
    }

    public class PatientUpdateProfileDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? BloodType { get; set; }
        public string? MedicalConditions { get; set; }
        public string? CurrentMedications { get; set; }
        public string? Allergies { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? EmergencyContactRelation { get; set; }
        public bool? HasInsurance { get; set; }
        public string? InsuranceProvider { get; set; }
        public string? InsurancePolicyNumber { get; set; }
        public string? PrimaryConcern { get; set; }
        public string? MentalHealthHistory { get; set; }
        public string? FamilyMentalHealthHistory { get; set; }
    }

    public class PatientMedicalHistoryDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string Condition { get; set; }
        public string? Description { get; set; }
        public DateTime DiagnosedDate { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string? Treatment { get; set; }
        public string? Medications { get; set; }
        public string? Severity { get; set; }
        public string? ReferencingDoctor { get; set; }
        public bool IsOngoing { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreatePatientMedicalHistoryDto
    {
        public required string Condition { get; set; }
        public string? Description { get; set; }
        public required DateTime DiagnosedDate { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string? Treatment { get; set; }
        public string? Medications { get; set; }
        public string? Severity { get; set; }
        public string? ReferencingDoctor { get; set; }
        public bool IsOngoing { get; set; }
    }

    public class UpdatePatientMedicalHistoryDto
    {
        public string? Condition { get; set; }
        public string? Description { get; set; }
        public DateTime? DiagnosedDate { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string? Treatment { get; set; }
        public string? Medications { get; set; }
        public string? Severity { get; set; }
        public string? ReferencingDoctor { get; set; }
        public bool? IsOngoing { get; set; }
    }

    public class PatientSearchDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? PrimaryConcern { get; set; }
        public bool IsActive { get; set; }
    }
}
