namespace NFS.Infrastructure.Helpers
{
    public static class PasswordHelper
    {
        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public static bool VerifyPassword(string enteredPassword, string hashedPassword)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(enteredPassword, hashedPassword);
            }
            catch
            {
                return false;
            }
        }
    }
}
