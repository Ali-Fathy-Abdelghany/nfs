using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NFS.Infrastructure.Migrations
{
    [DbContext(typeof(Data.ApplicationDbContext))]
    [Migration("20260714030000_AddExternalLogins")]
    public partial class AddExternalLogins : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'ExternalLogins', N'U') IS NULL
                BEGIN
                    CREATE TABLE ExternalLogins (
                        ExternalLoginId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ExternalLogins PRIMARY KEY,
                        Provider NVARCHAR(64) NOT NULL,
                        ProviderKey NVARCHAR(256) NOT NULL,
                        UserId INT NOT NULL,
                        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ExternalLogins_CreatedAt DEFAULT (SYSUTCDATETIME()),
                        CONSTRAINT FK_ExternalLogins_Users_UserId
                            FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
                    );

                    CREATE UNIQUE INDEX IX_ExternalLogins_Provider_ProviderKey
                        ON ExternalLogins (Provider, ProviderKey);
                END
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'ExternalLogins', N'U') IS NOT NULL
                    DROP TABLE ExternalLogins;
                """);
        }
    }
}
