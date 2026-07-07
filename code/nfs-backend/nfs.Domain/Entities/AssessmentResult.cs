using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace nfs.Domain.Entities
{
    public class AssessmentResult
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AssessmentId { get; set; }

        [Required]
        [MaxLength(200)]
        public string QuestionText { get; set; }

        [Required]
        public int QuestionNumber { get; set; }

        [Required]
        public int AnswerScore { get; set; }

        [MaxLength(500)]
        public string? AnswerText { get; set; }

        [MaxLength(100)]
        public string? Category { get; set; } // For categorizing questions in complex assessments

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("AssessmentId")]
        public Assessment Assessment { get; set; }
    }
}
