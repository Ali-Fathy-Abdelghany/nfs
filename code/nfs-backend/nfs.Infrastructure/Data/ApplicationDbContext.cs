using Microsoft.EntityFrameworkCore;
using nfs.Domain.Entities;
using System.Reflection.Emit;

namespace nfs.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<AvailabilitySlot> AvailabilitySlots { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<SessionNote> SessionNotes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

        }
    }
}