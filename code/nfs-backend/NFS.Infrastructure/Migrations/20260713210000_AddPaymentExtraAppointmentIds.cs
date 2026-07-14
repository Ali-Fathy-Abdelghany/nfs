using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NFS.Infrastructure.Migrations
{
    [DbContext(typeof(Data.ApplicationDbContext))]
    [Migration("20260713210000_AddPaymentExtraAppointmentIds")]
    public partial class AddPaymentExtraAppointmentIds : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH(N'Payments', N'ExtraAppointmentIds') IS NULL
                    ALTER TABLE Payments ADD ExtraAppointmentIds NVARCHAR(200) NULL;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH(N'Payments', N'ExtraAppointmentIds') IS NOT NULL
                    ALTER TABLE Payments DROP COLUMN ExtraAppointmentIds;
                """);
        }
    }
}
