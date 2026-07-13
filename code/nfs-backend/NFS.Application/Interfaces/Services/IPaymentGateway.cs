namespace NFS.Application.Interfaces.Services;

using NFS.Application.DTOs;

public interface IPaymentGateway
{
    Task<PaymentGatewaySession> CreateCheckoutSessionAsync(decimal amount, string currency, int paymentId);
    Task<bool> ConfirmPaymentAsync(string providerReference);
}
