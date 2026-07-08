# Nafs Backend API

ASP.NET Core Web API for the **Nafs** mental-health platform. Provides JWT authentication, user registration, profile management, and password reset flows backed by SQL Server.

## Tech stack

- .NET 10 / ASP.NET Core
- Entity Framework Core 8 (SQL Server)
- JWT Bearer authentication
- Swagger / OpenAPI (development)

## Project structure

```
nfs-backend/
├── Controllers/       # HTTP endpoints (auth, users)
├── Data/              # EF Core DbContext
├── DTOs/              # Request/response models
├── Enums/             # Shared enumerations
├── Helpers/           # JWT settings, password hashing
├── Middlewares/       # Global exception handling
├── Models/            # Database entities
├── Properties/        # Launch profiles
├── Services/          # Business logic
├── appsettings.json
└── appsettings.Development.json.example
```

## Prerequisites

- [.NET SDK 10](https://dotnet.microsoft.com/download) (or compatible preview)
- [SQL Server LocalDB](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb) (default) or any SQL Server instance

## Setup

1. Clone the repository and open a terminal in `code/nfs-backend`.

2. Copy the development settings template and adjust if needed:

   ```powershell
   Copy-Item appsettings.Development.json.example appsettings.Development.json
   ```

3. Update `ConnectionStrings:DefaultConnection` in `appsettings.Development.json` if you are not using LocalDB.

4. Restore and run:

   ```powershell
   dotnet restore
   dotnet run
   ```

5. Open Swagger UI at [http://localhost:5000/swagger](http://localhost:5000/swagger).

On first startup the app creates the database and seeds:

| Item | Value |
|------|-------|
| Admin email | `admin@nafs.com` |
| Admin password | `Admin123!` |
| Roles | CLIENT, THERAPIST, ADMIN |

## API endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive JWT + refresh token |
| POST | `/auth/logout` | Yes | Invalidate refresh token |
| POST | `/auth/refresh-token` | No | Refresh access token |
| POST | `/auth/forgot-password` | No | Request password reset token |
| POST | `/auth/reset-password` | No | Reset password with token |
| GET | `/users/profile` | Yes | Get current user profile |
| PUT | `/users/profile` | Yes | Update current user profile |

## Configuration

| Setting | Location | Notes |
|---------|----------|-------|
| Database connection | `ConnectionStrings:DefaultConnection` | LocalDB by default |
| JWT secret | `JwtSettings:Secret` | **Required** — set in `appsettings.Development.json` |
| JWT issuer/audience | `JwtSettings:Issuer`, `JwtSettings:Audience` | Defaults to `NafsApp` / `NafsAppUsers` |
| Token expiry | `JwtSettings:ExpiryMinutes` | Default 60 minutes |

Never commit real secrets. `appsettings.Development.json` is gitignored.

## Build

From the repository root (monorepo):

```powershell
dotnet build nfs.sln
```

From this folder:

```powershell
dotnet build
```

## License

Part of the Nafs graduation project.
