namespace NFS.Application.Interfaces.Services;

using NFS.Application.DTOs;

public interface IPaymentGateway
{
    Task<PaymentGatewaySession> CreateCheckoutSessionAsync(decimal amount, string currency, int paymentId);
    Task<bool> ConfirmPaymentAsync(string providerReference);

    /// <summary>
    /// Authoritatively check provider status (e.g. Paymob transaction inquiry).
    /// Returns true if paid, false if failed/declined, null if unknown / not supported.
    /// </summary>
    Task<bool?> VerifyWithProviderAsync(string? providerReference, string? merchantOrderId, string? transactionId);
}
