using NFS.Application.DTOs;
using NFS.Application.Interfaces.Services;

namespace NFS.Application.Services;

/// <summary>
/// Simulated payment gateway for local/dev testing — no real Stripe keys required.
/// Swap this registration for a StripePaymentGateway later.
/// </summary>
public class FakePaymentGateway : IPaymentGateway
{
    public Task<PaymentGatewaySession> CreateCheckoutSessionAsync(decimal amount, string currency, int paymentId)
    {
        var reference = $"fake_{paymentId}_{Guid.NewGuid():N}"[..32];
        return Task.FromResult(new PaymentGatewaySession
        {
            ProviderReference = reference,
            CheckoutUrl = $"/payments/simulate/{reference}"
        });
    }

    public Task<bool> ConfirmPaymentAsync(string providerReference)
    {
        // Always succeeds in fake mode
        return Task.FromResult(!string.IsNullOrWhiteSpace(providerReference));
    }
}
