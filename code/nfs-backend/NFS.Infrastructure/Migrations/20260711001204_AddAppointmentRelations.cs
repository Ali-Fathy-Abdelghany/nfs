using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NFS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAppointmentRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AssessmentResults_Assessments_AssessmentId",
                table: "AssessmentResults");

            migrationBuilder.DropForeignKey(
                name: "FK_AssessmentResults_Patients_PatientId",
                table: "AssessmentResults");

            migrationBuilder.DropForeignKey(
                name: "FK_Assessments_Therapists_TherapistId",
                table: "Assessments");

            migrationBuilder.AddColumn<int>(
                name: "AssessmentId1",
                table: "AssessmentResults",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PatientId1",
                table: "AssessmentResults",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AvailabilitySlots_DoctorId",
                table: "AvailabilitySlots",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentResults_AssessmentId1",
                table: "AssessmentResults",
                column: "AssessmentId1");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentResults_PatientId1",
                table: "AssessmentResults",
                column: "PatientId1");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_DoctorId",
                table: "Appointments",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_PatientId",
                table: "Appointments",
                column: "PatientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Patients_PatientId",
                table: "Appointments",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "PatientId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Therapists_DoctorId",
                table: "Appointments",
                column: "DoctorId",
                principalTable: "Therapists",
                principalColumn: "TherapistId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssessmentResults_Assessments_AssessmentId",
                table: "AssessmentResults",
                column: "AssessmentId",
                principalTable: "Assessments",
                principalColumn: "AssessmentId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssessmentResults_Assessments_AssessmentId1",
                table: "AssessmentResults",
                column: "AssessmentId1",
                principalTable: "Assessments",
                principalColumn: "AssessmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_AssessmentResults_Patients_PatientId",
                table: "AssessmentResults",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "PatientId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssessmentResults_Patients_PatientId1",
                table: "AssessmentResults",
                column: "PatientId1",
                principalTable: "Patients",
                principalColumn: "PatientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assessments_Therapists_TherapistId",
                table: "Assessments",
                column: "TherapistId",
                principalTable: "Therapists",
                principalColumn: "TherapistId");

            migrationBuilder.AddForeignKey(
                name: "FK_AvailabilitySlots_Therapists_DoctorId",
                table: "AvailabilitySlots",
                column: "DoctorId",
                principalTable: "Therapists",
                principalColumn: "TherapistId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Patients_PatientId",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Therapists_DoctorId",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_AssessmentResults_Assessments_AssessmentId",
                table: "AssessmentResults");

            migrationBuilder.DropForeignKey(
                name: "FK_AssessmentResults_Assessments_AssessmentId1",
                table: "AssessmentResults");

            migrationBuilder.DropForeignKey(
                name: "FK_AssessmentResults_Patients_PatientId",
                table: "AssessmentResults");

            migrationBuilder.DropForeignKey(
                name: "FK_AssessmentResults_Patients_PatientId1",
                table: "AssessmentResults");

            migrationBuilder.DropForeignKey(
                name: "FK_Assessments_Therapists_TherapistId",
                table: "Assessments");

            migrationBuilder.DropForeignKey(
                name: "FK_AvailabilitySlots_Therapists_DoctorId",
                table: "AvailabilitySlots");

            migrationBuilder.DropIndex(
                name: "IX_AvailabilitySlots_DoctorId",
                table: "AvailabilitySlots");

            migrationBuilder.DropIndex(
                name: "IX_AssessmentResults_AssessmentId1",
                table: "AssessmentResults");

            migrationBuilder.DropIndex(
                name: "IX_AssessmentResults_PatientId1",
                table: "AssessmentResults");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_DoctorId",
                table: "Appointments");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_PatientId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "AssessmentId1",
                table: "AssessmentResults");

            migrationBuilder.DropColumn(
                name: "PatientId1",
                table: "AssessmentResults");

            migrationBuilder.AddForeignKey(
                name: "FK_AssessmentResults_Assessments_AssessmentId",
                table: "AssessmentResults",
                column: "AssessmentId",
                principalTable: "Assessments",
                principalColumn: "AssessmentId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AssessmentResults_Patients_PatientId",
                table: "AssessmentResults",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "PatientId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Assessments_Therapists_TherapistId",
                table: "Assessments",
                column: "TherapistId",
                principalTable: "Therapists",
                principalColumn: "TherapistId",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
