using Microsoft.EntityFrameworkCore;
using NafsApp.Models;

namespace NafsApp.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Therapist> Therapists { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Availability> Availabilities { get; set; }
        public DbSet<SessionParticipant> SessionParticipants { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<SessionRecording> SessionRecordings { get; set; }









        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server=.;Database=NafsApp;Trusted_Connection=True;");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasKey(u => u.UserId);

            modelBuilder.Entity<User>()
                .Property(u => u.FirstName)
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(u => u.LastName)
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(u => u.PasswordHash)
                .IsRequired();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Therapist>()
                .HasKey(t => t.TherapistId);

            modelBuilder.Entity<Therapist>()
                .Property(t => t.SessionPrice)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Therapist>()
                .HasOne(t => t.User)
                .WithOne(u => u.Therapist)
                .HasForeignKey<Therapist>(t => t.TherapistId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Client>()
                .HasKey(c => c.ClientId);

            modelBuilder.Entity<Client>()
                .HasOne(c => c.User)
                .WithOne(u => u.Client)
                .HasForeignKey<Client>(c => c.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Session>()
                .HasKey(s => s.SessionId);

            modelBuilder.Entity<Session>()
                .Property(s => s.Price)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Session>()
                .HasOne(s => s.Therapist)
                .WithMany(t => t.Sessions)
                .HasForeignKey(s => s.TherapistId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasKey(b => b.BookingId);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Client)
                .WithMany(c => c.Bookings)
                .HasForeignKey(b => b.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Session)
                .WithMany(s => s.Bookings)
                .HasForeignKey(b => b.SessionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Payment>()
                .HasKey(p => p.PaymentId);

            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Booking)
                .WithOne(b => b.Payment)
                .HasForeignKey<Payment>(p => p.BookingId)
                .OnDelete(DeleteBehavior.Cascade);



            modelBuilder.Entity<MedicalRecord>()
               .HasOne(m => m.Client)
               .WithMany(c => c.MedicalRecords)
               .HasForeignKey(m => m.ClientId);

            modelBuilder.Entity<MedicalRecord>()
               .HasOne(m => m.Therapist)
               .WithMany()
               .HasForeignKey(m => m.TherapistId);
            modelBuilder.Entity<SessionParticipant>()
            .HasKey(sp => new { sp.SessionId, sp.ClientId });

            modelBuilder.Entity<SessionParticipant>()
                .HasOne(sp => sp.Session)
                .WithMany(s => s.Participants)
                .HasForeignKey(sp => sp.SessionId);

            modelBuilder.Entity<SessionParticipant>()
                .HasOne(sp => sp.Client)
                .WithMany()
                .HasForeignKey(sp => sp.ClientId);


            modelBuilder.Entity<SessionRecording>()
                .HasOne(r => r.Session)
                .WithOne(s => s.Recording)
                .HasForeignKey<SessionRecording>(r => r.SessionId);

            modelBuilder.Entity<Availability>()
                .HasKey(a => a.AvailabilityId);

            modelBuilder.Entity<Availability>()
                .HasOne(a => a.Therapist)
                .WithMany(t => t.Availabilities)
                .HasForeignKey(a => a.TherapistId);
           
             modelBuilder.Entity<Notification>()
                 .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId);
             modelBuilder.Entity<Review>()
                  .HasOne(r => r.Client)
                  .WithMany(c => c.Reviews)
                   .HasForeignKey(r => r.ClientId);

    modelBuilder.Entity<Review>()
        .HasOne(r => r.Therapist)
        .WithMany(t => t.Reviews)
        .HasForeignKey(r => r.TherapistId);

    modelBuilder.Entity<Review>()
        .HasOne(r => r.Session)
        .WithMany(s => s.Reviews)
        .HasForeignKey(r => r.SessionId);

 modelBuilder.Entity<Booking>()
        .HasIndex(b => new { b.ClientId, b.SessionId })
        .IsUnique(); // prevent duplicate booking


        }
    }
}