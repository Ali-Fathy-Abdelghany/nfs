using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NFS.Infrastructure.Migrations
{
    [DbContext(typeof(Data.ApplicationDbContext))]
    [Migration("20260714020000_AddTherapistStatusAndReminders")]
    public partial class AddTherapistStatusAndReminders : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH(N'Therapists', N'Status') IS NULL
                    ALTER TABLE Therapists ADD Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Therapists_Status DEFAULT N'Pending';

                IF COL_LENGTH(N'Therapists', N'RejectionReason') IS NULL
                    ALTER TABLE Therapists ADD RejectionReason NVARCHAR(1000) NULL;

                IF COL_LENGTH(N'Therapists', N'VerifiedAt') IS NULL
                    ALTER TABLE Therapists ADD VerifiedAt DATETIME2 NULL;

                IF COL_LENGTH(N'Appointments', N'ReminderSentAt') IS NULL
                    ALTER TABLE Appointments ADD ReminderSentAt DATETIME2 NULL;
                """);

            // Separate batch so newly added Status is visible to the compiler.
            migrationBuilder.Sql("""
                UPDATE Therapists SET Status = N'Approved', VerifiedAt = ISNULL(UpdatedAt, CreatedAt)
                WHERE IsVerified = 1 AND (Status IS NULL OR Status = N'Pending' OR Status = N'0');

                UPDATE Therapists SET Status = N'Pending'
                WHERE IsVerified = 0 AND (Status IS NULL OR Status = N'0' OR Status = N'');
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH(N'Appointments', N'ReminderSentAt') IS NOT NULL
                    ALTER TABLE Appointments DROP COLUMN ReminderSentAt;

                IF COL_LENGTH(N'Therapists', N'VerifiedAt') IS NOT NULL
                    ALTER TABLE Therapists DROP COLUMN VerifiedAt;

                IF COL_LENGTH(N'Therapists', N'RejectionReason') IS NOT NULL
                    ALTER TABLE Therapists DROP COLUMN RejectionReason;

                IF COL_LENGTH(N'Therapists', N'Status') IS NOT NULL
                BEGIN
                    DECLARE @df sysname;
                    SELECT @df = dc.name
                    FROM sys.default_constraints dc
                    INNER JOIN sys.columns c ON c.default_object_id = dc.object_id
                    WHERE dc.parent_object_id = OBJECT_ID(N'Therapists') AND c.name = N'Status';
                    IF @df IS NOT NULL EXEC(N'ALTER TABLE Therapists DROP CONSTRAINT [' + @df + N']');
                    ALTER TABLE Therapists DROP COLUMN Status;
                END
                """);
        }
    }
}
