using System;
using System.Collections.Generic;

namespace NFS.Application.DTOs
{
    public class CreateAssessmentDto
    {
        public int PatientId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string AnswersJson { get; set; } = string.Empty;
        public int? Score { get; set; }
    }

    public class AssessmentDto
    {
        public int AssessmentId { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string AnswersJson { get; set; } = string.Empty;
        public int? Score { get; set; }
        public DateTime CompletedAt { get; set; }
    }

    public class AssessmentResultDto
    {
        public int Id { get; set; }
        public int AssessmentId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public int QuestionNumber { get; set; }
        public int AnswerScore { get; set; }
        public string? AnswerText { get; set; }
        public string? Category { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateAssessmentResultDto
    {
        public int QuestionNumber { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public int AnswerScore { get; set; }
        public string? AnswerText { get; set; }
        public string? Category { get; set; }
    }

    public class SubmitAssessmentResultsDto
    {
        public int AssessmentId { get; set; }
        public List<CreateAssessmentResultDto> Results { get; set; } = new();
        public string? Observations { get; set; }
    }

    public class AssessmentSummaryDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string AssessmentType { get; set; } = string.Empty;
        public DateTime AssessmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? TotalScore { get; set; }
        public string? ScoreInterpretation { get; set; }
    }

    public class CompleteAssessmentDto
    {
        public int AssessmentId { get; set; }
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
