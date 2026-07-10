using System;
using System.Collections.Generic;
using NFS.Domain.Enums;

namespace NFS.Domain.Entities
{
    public class Role
    {
        public int RoleId { get; set; }
        public required string RoleName { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<UserRoleMapping> UserRoles { get; set; } = new List<UserRoleMapping>();
    }
}
