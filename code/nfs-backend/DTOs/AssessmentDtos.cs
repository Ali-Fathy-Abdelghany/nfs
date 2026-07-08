using System;
using System.Collections.Generic;

namespace nfs.Application.DTOs
{
    public class CreateAssessmentDto
    {
        public required int PatientId { get; set; }
        public int? TherapistId { get; set; }
        public required string AssessmentType { get; set; }
        public string? Description { get; set; }
    }

    public class AssessmentDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int? TherapistId { get; set; }
        public string AssessmentType { get; set; }
        public string? Description { get; set; }
        public DateTime AssessmentDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string Status { get; set; }
        public string? Observations { get; set; }
        public string? Recommendations { get; set; }
        public int? TotalScore { get; set; }
        public string? ScoreInterpretation { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<AssessmentResultDto> Results { get; set; } = new();
    }

    public class AssessmentResultDto
    {
        public int Id { get; set; }
        public int AssessmentId { get; set; }
        public string QuestionText { get; set; }
        public int QuestionNumber { get; set; }
        public int AnswerScore { get; set; }
        public string? AnswerText { get; set; }
        public string? Category { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateAssessmentResultDto
    {
        public required int QuestionNumber { get; set; }
        public required string QuestionText { get; set; }
        public required int AnswerScore { get; set; }
        public string? AnswerText { get; set; }
        public string? Category { get; set; }
    }

    public class SubmitAssessmentResultsDto
    {
        public int AssessmentId { get; set; }
        public required List<CreateAssessmentResultDto> Results { get; set; }
        public string? Observations { get; set; }
    }

    public class AssessmentSummaryDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string AssessmentType { get; set; }
        public DateTime AssessmentDate { get; set; }
        public string Status { get; set; }
        public int? TotalScore { get; set; }
        public string? ScoreInterpretation { get; set; }
    }

    public class CompleteAssessmentDto
    {
        public required int AssessmentId { get; set; }
        public int? TotalScore { get; set; }
        public string? ScoreInterpretation { get; set; }
        public string? Recommendations { get; set; }
        public string? Observations { get; set; }
    }

    public class AssessmentHistoryDto
    {
        public int PatientId { get; set; }
        public List<AssessmentSummaryDto> Assessments { get; set; } = new();
    }
}
