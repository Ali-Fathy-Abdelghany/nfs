namespace NFS.Domain.Entities
{
    public class UserRoleMapping
    {
        public int UserRoleId { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public int? AssignedBy { get; set; }

        public User? User { get; set; }
        public Role? Role { get; set; }
        public User? Assigner { get; set; }
    }
}
