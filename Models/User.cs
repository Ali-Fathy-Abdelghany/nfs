using System;

namespace NafsApp.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Email { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public string Gender { get; set; } = "";
        public DateTime? DateOfBirth { get; set; }
        public int? Age { get; set; }
        public string Address { get; set; } = "";
        public string ImageUrl { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public DateTime? LastLogin { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public Therapist? Therapist { get; set; }
        public Client? Client { get; set; }
    }
}