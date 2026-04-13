using Microsoft.AspNetCore.Identity;
using NafsApp.Models;

namespace NafsApp.Helpers
{
    public static class PasswordHelper
    {
        public static string HashPassword(User user, string password)
        {
            var hasher = new PasswordHasher<User>();
            return hasher.HashPassword(user, password);
        }

        public static bool VerifyPassword(User user, string hashedPassword, string enteredPassword)
        {
            var hasher = new PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(user, hashedPassword, enteredPassword);

            return result == PasswordVerificationResult.Success
                || result == PasswordVerificationResult.SuccessRehashNeeded;
        }
    }
}