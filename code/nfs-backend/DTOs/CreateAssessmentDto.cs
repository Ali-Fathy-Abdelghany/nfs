using System.ComponentModel.DataAnnotations;

namespace NafsApp.DTOs
{
    public class CreateAssessmentDto
    {
        [Required]
        public int PatientId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;
        
        [Required]
        public string AnswersJson { get; set; } = null!;
        
        public int? Score { get; set; }
    }
}
