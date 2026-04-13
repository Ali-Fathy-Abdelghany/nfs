using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using NafsApp.Data;
using NafsApp.Helpers;
using NafsApp.Models;

namespace NafsApp
{
    internal class Program
    {
        static void Main(string[] args)
        {
            using AppDbContext db = new AppDbContext();

            db.Database.EnsureDeleted();
            db.Database.EnsureCreated();

            var therapistUser = new User
            {
                FirstName = "Ahmed",
                LastName = "Ali",
                Email = "ahmed@nafs.com",
                PhoneNumber = "01012345678",
                Gender = "Male",
                DateOfBirth = new DateTime(1990, 5, 10),
                Age = 34,
                Address = "Cairo",
                ImageUrl = "ahmed.png",
                LastLogin = DateTime.Now,
                IsActive = true
            };
            therapistUser.PasswordHash = PasswordHelper.HashPassword(therapistUser, "123456");

            var clientUser = new User
            {
                FirstName = "Yousef",
                LastName = "Shawky",
                Email = "yousef@nafs.com",
                PhoneNumber = "01198765432",
                Gender = "Male",
                DateOfBirth = new DateTime(2004, 1, 1),
                Age = 21,
                Address = "Giza",
                ImageUrl = "yousef.png",
                LastLogin = DateTime.Now,
                IsActive = true
            };
            clientUser.PasswordHash = PasswordHelper.HashPassword(clientUser, "abcdef");

            db.Users.AddRange(therapistUser, clientUser);
            db.SaveChanges();

            var therapist = new Therapist
            {
                TherapistId = therapistUser.UserId,
                Specialization = "Anxiety",
                Bio = "Therapist specialized in anxiety treatment",
                SessionPrice = 300,
                IsVerified = true,
                LicenseFile = "license.pdf"
            };

            var client = new Client
            {
                ClientId = clientUser.UserId,
                TherapyGoal = "Improve mental health",
                RiskFlag = false,
                PrimaryConcern = "Stress",
                MaritalStatus = "Single",
                EmergencyContactName = "Mohamed",
                EmergencyContactPhone = "01222222222"
            };

            db.Therapists.Add(therapist);
            db.Clients.Add(client);
            db.SaveChanges();

            var session = new Session
            {
                TherapistId = therapist.TherapistId,
                Title = "جلسة علاج فردي",
                Description = "جلسة أونلاين لمدة ساعة",
                SessionType = "Online",
                Price = 300,
                MaxCapacity = 1,
                Status = "Available",
                StartTime = DateTime.Now.AddDays(1),
                EndTime = DateTime.Now.AddDays(1).AddHours(1),
                CreatedAt = DateTime.Now
            };

            db.Sessions.Add(session);
            db.SaveChanges();

            var booking = new Booking
            {
                ClientId = client.ClientId,
                SessionId = session.SessionId,
                BookingDate = DateTime.Now,
                Status = "Confirmed",
                IsFreeTrial = false,
                CancelledAt = null,
                CancellationReason = "",
                CancelledBy = ""
            };

            db.Bookings.Add(booking);
            db.SaveChanges();

            var payment = new Payment
            {
                BookingId = booking.BookingId,
                Amount = 300,
                Currency = "EGP",
                PaymentMethod = "Card",
                PaymentStatus = "Paid",
                TransactionReference = "TXN-1001",
                PaymentGateway = "Visa",
                TransactionDate = DateTime.Now
            };

            db.Payments.Add(payment);
            db.SaveChanges();

            Console.WriteLine("Data saved successfully.");
            Console.WriteLine();

            var testUser = db.Users.FirstOrDefault(u => u.Email == "yousef@nafs.com");

            if (testUser != null)
            {
                bool isCorrect = PasswordHelper.VerifyPassword(testUser, testUser.PasswordHash, "abcdef");
                Console.WriteLine($"Password check for {testUser.Email}: {isCorrect}");
                Console.WriteLine();
            }

            var result = db.Bookings
                .Include(b => b.Client)
                    .ThenInclude(c => c!.User)
                .Include(b => b.Session)
                    .ThenInclude(s => s!.Therapist)
                    .ThenInclude(t => t!.User)
                .Include(b => b.Payment)
                .ToList();

            foreach (var item in result)
            {
                Console.WriteLine($"Booking ID: {item.BookingId}");
                Console.WriteLine($"Client: {item.Client?.User?.FirstName} {item.Client?.User?.LastName}");
                Console.WriteLine($"Therapist: {item.Session?.Therapist?.User?.FirstName} {item.Session?.Therapist?.User?.LastName}");
                Console.WriteLine($"Session: {item.Session?.Title}");
                Console.WriteLine($"Payment Status: {item.Payment?.PaymentStatus}");
                Console.WriteLine(new string('-', 30));
            }
        }
    }
}