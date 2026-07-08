# 🚀 NAFS Backend - SQL Server + EF Core Configuration

## Database Configuration ✅

### Connection String
**File:** `appsettings.json`
```json
{
	"ConnectionStrings": {
		"DefaultConnection": "Server=.;Database=NafsApp;Trusted_Connection=True;Encrypt=false;"
	}
}
```

**Details:**
- Server: Local SQL Server (`.`)
- Database: NafsApp
- Authentication: Windows Integrated (Trusted_Connection=True)
- Encryption: Disabled for local development

---

## Entity Framework Core Setup ✅

### DbContext Configuration
**File:** `Data/AppDbContext.cs`

**Database Provider:** Microsoft.EntityFrameworkCore.SqlServer v8.0.8

**DbSets (Tables):**
- Users
- Therapists
- Clients (Patients)
- Sessions
- Bookings
- Payments
- Reviews
- MedicalRecords
- Availabilities
- SessionParticipants
- Notifications
- SessionRecordings
- **Specializations** ✨ (NEW)
- **TherapistSpecializations** ✨ (NEW)
- **Assessments** ✨ (NEW)
- **AssessmentResults** ✨ (NEW)
- **PatientMedicalHistories** ✨ (NEW)

**OnConfiguring:** Uses SQL Server connection string from appsettings.json
**OnModelCreating:** Full relationship mappings and constraints configured

---

## How to Run

### 1. Build the project
```powershell
cd "C:\Users\shahd elzeiny\source\repos\Ali-Fathy-Abdelghany\nfs"
dotnet build NfsApp.csproj
```

### 2. Create/Migrate Database
Option A - Using Package Manager Console:
```powershell
Add-Migration InitialCreate
Update-Database
```

Option B - Using dotnet CLI:
```powershell
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 3. Run the Application
```powershell
dotnet run --project NfsApp.csproj
```

### 4. Test in Swagger
Open your browser:
```
https://localhost:7001/swagger/index.html
```

---

## New API Endpoints (Therapist & Patient Management)

### 👨‍⚕️ Therapists
- `GET /api/therapists` - Get all therapists
- `GET /api/therapists/{id}` - Get specific therapist
- `POST /api/therapists` - Register new therapist
- `POST /api/therapists/{id}/approve` - Approve therapist
- `GET /api/therapists/search?q={query}` - Search therapists

### 👥 Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/{id}` - Get specific patient
- `POST /api/patients` - Register new patient
- `GET /api/patients/{id}/medical-history` - Get patient medical history

### 🏷️ Specializations
- `GET /api/specializations` - Get all specializations
- `GET /api/specializations/{id}` - Get specific specialization
- `POST /api/specializations` - Add new specialization

### 📋 Assessments
- `GET /api/assessments` - Get all assessments
- `POST /api/assessments` - Create new assessment
- `POST /api/assessments/{id}/results` - Save assessment result

---

## Sample Data

On first run, the database will be seeded with:
- **1 Therapist:** Ahmed Ali (verified, specialized in Anxiety)
- **1 Patient:** Yousef Shawky
- **1 Specialization:** Anxiety
- **1 Session:** Scheduled therapy session
- **1 Booking:** Confirmed booking
- **1 Payment:** Paid transaction

---

## Project Structure

```
NfsApp/
├── Program.cs                    (ASP.NET Core startup)
├── appsettings.json              (Configuration)
├── NfsApp.csproj                 (Project file - SQL Server configured)
├── Models/
│   ├── User.cs
│   ├── Therapist.cs
│   ├── Client.cs
│   ├── Specialization.cs         ✨ NEW
│   ├── TherapistSpecialization.cs ✨ NEW
│   ├── Assessment.cs             ✨ NEW
│   ├── AssessmentResult.cs       ✨ NEW
│   ├── PatientMedicalHistory.cs  ✨ NEW
│   └── ...other models
├── Controllers/
│   ├── TherapistsController.cs   ✨ NEW
│   ├── PatientsController.cs     ✨ NEW
│   ├── SpecializationsController.cs ✨ NEW
│   ├── AssessmentsController.cs  ✨ NEW
│   └── ...other controllers
├── Data/
│   └── AppDbContext.cs           (EF Core DbContext - SQL Server)
└── Enums/
	└── ...enum types
```

---

## Requirements

✅ .NET 8.0
✅ SQL Server (LocalDB or Express)
✅ Entity Framework Core 8.0.8
✅ Swagger/OpenAPI for testing
✅ Windows Authentication enabled

---

## What's Ready?

✅ Database models defined with EF Core ORM
✅ SQL Server connection configured
✅ DbContext with all relationships mapped
✅ 4 new API controllers with CRUD endpoints
✅ Swagger UI for API testing
✅ Sample data seeding on startup
✅ CORS enabled for frontend communication

---

**Status:** Ready to run! 🎉
