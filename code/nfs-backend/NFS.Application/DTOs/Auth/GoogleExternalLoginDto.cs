using System.ComponentModel.DataAnnotations;

namespace NFS.Application.DTOs
{
    public class GoogleExternalLoginDto
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;
    }
}
