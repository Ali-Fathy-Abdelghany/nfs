using System;
using NafsApp.Enums;

namespace NafsApp.Models
{
    public class User
    {
        public int UserId { get; set; }
        public required string FirstName { get; set; }
        public  required string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public Gender Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Address { get; set; }
        public string ImageUrl { get; set; }
        public string PasswordHash { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
         
         public Therapist? Therapist { get; set; }
public Client? Client { get; set; }
    }
}