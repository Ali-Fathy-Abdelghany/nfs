using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NfsApp.Migrations
{
    /// <inheritdoc />
    public partial class AddTherapistPatientAssessment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ROLES",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ROLES", x => x.role_id);
                });

            migrationBuilder.CreateTable(
                name: "USERS",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    first_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    gender = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    date_of_birth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    profile_image_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    governorate = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    refresh_token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    refresh_token_expiry = table.Column<DateTime>(type: "datetime2", nullable: true),
                    password_reset_token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    password_reset_token_expiry = table.Column<DateTime>(type: "datetime2", nullable: true),
                    is_email_verified = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    email_verification_token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USERS", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "PATIENTS",
                columns: table => new
                {
                    patient_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    emergency_contact_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    emergency_contact_phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    medical_history = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PATIENTS", x => x.patient_id);
                    table.ForeignKey(
                        name: "FK_PATIENTS_USERS_user_id",
                        column: x => x.user_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "THERAPISTS",
                columns: table => new
                {
                    therapist_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    specialization = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    bio = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    experience_years = table.Column<int>(type: "int", nullable: false),
                    hourly_rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    rating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    qualifications = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_THERAPISTS", x => x.therapist_id);
                    table.ForeignKey(
                        name: "FK_THERAPISTS_USERS_user_id",
                        column: x => x.user_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "USER_ROLES",
                columns: table => new
                {
                    user_role_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    role_id = table.Column<int>(type: "int", nullable: false),
                    assigned_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    assigned_by = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USER_ROLES", x => x.user_role_id);
                    table.ForeignKey(
                        name: "FK_USER_ROLES_ROLES_role_id",
                        column: x => x.role_id,
                        principalTable: "ROLES",
                        principalColumn: "role_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_USER_ROLES_USERS_assigned_by",
                        column: x => x.assigned_by,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_USER_ROLES_USERS_user_id",
                        column: x => x.user_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ASSESSMENTS",
                columns: table => new
                {
                    assessment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    patient_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    answers_json = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    score = table.Column<int>(type: "int", nullable: true),
                    completed_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ASSESSMENTS", x => x.assessment_id);
                    table.ForeignKey(
                        name: "FK_ASSESSMENTS_PATIENTS_patient_id",
                        column: x => x.patient_id,
                        principalTable: "PATIENTS",
                        principalColumn: "patient_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ASSESSMENTS_patient_id",
                table: "ASSESSMENTS",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_PATIENTS_user_id",
                table: "PATIENTS",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ROLES_role_name",
                table: "ROLES",
                column: "role_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_THERAPISTS_user_id",
                table: "THERAPISTS",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_USER_ROLES_assigned_by",
                table: "USER_ROLES",
                column: "assigned_by");

            migrationBuilder.CreateIndex(
                name: "IX_USER_ROLES_role_id",
                table: "USER_ROLES",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_USER_ROLES_user_id",
                table: "USER_ROLES",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_USER_ROLES_user_id_role_id",
                table: "USER_ROLES",
                columns: new[] { "user_id", "role_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_USERS_email",
                table: "USERS",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ASSESSMENTS");

            migrationBuilder.DropTable(
                name: "THERAPISTS");

            migrationBuilder.DropTable(
                name: "USER_ROLES");

            migrationBuilder.DropTable(
                name: "PATIENTS");

            migrationBuilder.DropTable(
                name: "ROLES");

            migrationBuilder.DropTable(
                name: "USERS");
        }
    }
}
