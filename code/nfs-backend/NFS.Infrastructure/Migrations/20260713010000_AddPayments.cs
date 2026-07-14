using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NFS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'Payments', N'U') IS NULL
                BEGIN
                    CREATE TABLE Payments (
                        Id INT IDENTITY(1,1) NOT NULL,
                        AppointmentId INT NULL,
                        PatientId INT NOT NULL,
                        DoctorId INT NULL,
                        Amount DECIMAL(18,2) NOT NULL,
                        Currency NVARCHAR(10) NOT NULL,
                        Status NVARCHAR(30) NOT NULL,
                        Provider NVARCHAR(50) NOT NULL,
                        ProviderReference NVARCHAR(100) NULL,
                        CheckoutUrl NVARCHAR(2000) NULL,
                        PlanType NVARCHAR(50) NULL,
                        CreatedAt DATETIME2 NOT NULL,
                        PaidAt DATETIME2 NULL,
                        CONSTRAINT PK_Payments PRIMARY KEY (Id),
                        CONSTRAINT FK_Payments_Patients_PatientId FOREIGN KEY (PatientId) REFERENCES Patients(PatientId) ON DELETE NO ACTION,
                        CONSTRAINT FK_Payments_Therapists_DoctorId FOREIGN KEY (DoctorId) REFERENCES Therapists(TherapistId) ON DELETE NO ACTION,
                        CONSTRAINT FK_Payments_Appointments_AppointmentId FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id) ON DELETE SET NULL
                    );
                    CREATE INDEX IX_Payments_PatientId ON Payments(PatientId);
                    CREATE INDEX IX_Payments_DoctorId ON Payments(DoctorId);
                    CREATE INDEX IX_Payments_AppointmentId ON Payments(AppointmentId);
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Payments");
        }
    }
}
