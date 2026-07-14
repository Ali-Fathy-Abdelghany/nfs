using System;

namespace NFS.Domain.Entities
{
    public class ExternalLogin
    {
        public int ExternalLoginId { get; set; }
        public required string Provider { get; set; }
        public required string ProviderKey { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
