# Beginner-Friendly Features

The ProofRails SDK includes powerful features designed specifically for developers with zero blockchain experience.

##  Smart Auto-Detection

The SDK automatically detects network settings from your connected wallet:

```typescript
import { useProofRailsPayment } from '@proofrails/sdk/react';

const { send } = useProofRailsPayment(sdk);

// Just provide the essentials - SDK handles the rest!
await send({
    amount: "10.0",
    to: "0xRecipient...",
    purpose: "Payment for services"
    // ✨ No need to specify: chain, currency, sender
    // SDK auto-detects from your wallet!
});
```

##  Input Validation

Validate user inputs before sending to catch errors early:

```typescript
import { validateAddress, validateAmount, validatePayment } from '@proofrails/sdk';

// Validate individual fields
const addressCheck = validateAddress("0x1234...");
if (!addressCheck.isValid) {
    console.error(addressCheck.error);
    // "Address must be 42 characters long (0x + 40 hex digits)"
}

const amountCheck = validateAmount("10.5");
if (!amountCheck.isValid) {
    console.error(amountCheck.error);
}

// Or validate everything at once
const paymentCheck = validatePayment({
    amount: "10.0",
    to: "0xRecipient...",
    purpose: "Payment"
});

if (!paymentCheck.isValid) {
    alert(paymentCheck.error); // User-friendly message!
}
```

##  Friendly Error Messages

Errors are automatically converted to helpful, actionable messages:

```typescript
import { getFriendlyError, formatErrorForDisplay } from '@proofrails/sdk';

try {
    await sdk.receipts.create({...});
} catch (error) {
    // Get structured error info
    const friendly = getFriendlyError(error);
    console.log(friendly.title);     // " Middleware Wallet Needs Funding"
    console.log(friendly.message);   // Clear explanation
    console.log(friendly.solution);  // "Send 0.5-1.0 C2FLR tokens..."
    console.log(friendly.learnMore); // Link to docs

    // Or get formatted string for display
    const formatted = formatErrorForDisplay(error);
    alert(formatted);
    /*
     Middleware Wallet Needs Funding
    Your ProofRails middleware wallet doesn't have enough tokens...
    
     Solution: Send 0.5-1.0 C2FLR tokens to your middleware wallet...

    */
}
```

##  Chain Utilities

Helper functions for working with different networks:

```typescript
import { 
    detectNetwork, 
    detectCurrency, 
    getChainInfo,
    getExplorerUrl 
} from '@proofrails/sdk';

// Auto-detect from chain ID
const network = detectNetwork(114);  // "coston2"
const currency = detectCurrency(114); // "C2FLR"

// Get full chain info
const info = getChainInfo(114);
console.log(info.name);        // "Coston2"
console.log(info.rpcUrl);      // "https://coston2-api.flare.network/ext/C/rpc"
console.log(info.explorerUrl); // "https://coston2-explorer.flare.network"

// Generate explorer links
const txUrl = getExplorerUrl(114, "0x123...");
// "https://coston2-explorer.flare.network/tx/0x123..."
```

##  Complete Example

Here's a full example combining all beginner-friendly features:

```typescript
import { 
    useProofRails, 
    useProofRailsPayment,
    validatePayment,
    formatErrorForDisplay 
} from '@proofrails/sdk/react';

function PaymentForm() {
    const sdk = useProofRails({ apiKey: 'your-key' });
    const { send, loading, error } = useProofRailsPayment(sdk);

    const handlePay = async (amount: string, to: string, purpose: string) => {
        // 1. Validate inputs
        const validation = validatePayment({ amount, to, purpose });
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        try {
            // 2. Send payment (auto-detects chain & currency)
            const receipt = await send({ amount, to, purpose });
            
            alert(` Payment successful! Receipt ID: ${receipt.id}`);
        } catch (err) {
            // 3. Show friendly error
            alert(formatErrorForDisplay(err));
        }
    };

    return (
        <div>
            {/* Your form UI */}
            {error && <div className="error">{error}</div>}
            <button onClick={() => handlePay("10", "0x...", "Test")} disabled={loading}>
                {loading ? 'Processing...' : 'Pay Now'}
            </button>
        </div>
    );
}
```

##  All Validation Functions

- `validateAddress(address)` - Check Ethereum address format
- `validateAmount(amount)` - Check amount is valid number > 0
- `validateTransactionHash(hash)` - Check transaction hash format
- `validateApiKey(key)` - Check API key format
- `validatePurpose(text)` - Check purpose/reference text
- `validatePayment(params)` - Validate all payment fields at once

##  Supported Chains

- **Flare** (Chain ID: 14)
  - Network: `flare`
  - Currency: `FLR`
  
- **Coston2** (Chain ID: 114) - Testnet
  - Network: `coston2`
  - Currency: `C2FLR`
