using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NFS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDiaryEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'DiaryEntries', N'U') IS NULL
                BEGIN
                    CREATE TABLE DiaryEntries (
                        Id INT IDENTITY(1,1) NOT NULL,
                        PatientId INT NOT NULL,
                        Title NVARCHAR(200) NOT NULL,
                        Content NVARCHAR(MAX) NOT NULL,
                        Mood NVARCHAR(50) NOT NULL,
                        CreatedAt DATETIME2 NOT NULL,
                        UpdatedAt DATETIME2 NULL,
                        CONSTRAINT PK_DiaryEntries PRIMARY KEY (Id),
                        CONSTRAINT FK_DiaryEntries_Patients_PatientId FOREIGN KEY (PatientId) REFERENCES Patients(PatientId) ON DELETE CASCADE
                    );
                    CREATE INDEX IX_DiaryEntries_PatientId ON DiaryEntries(PatientId);
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DiaryEntries");
        }
    }
}
