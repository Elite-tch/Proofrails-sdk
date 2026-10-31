import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ProofRails } from './index';
import type { SDKConfig, PaginatedResponse } from './types/common';
import type { Receipt, ListReceiptsOptions } from './types/receipt';
import type { VerificationResult } from './types/verification';
import type { X402Payment, X402PaymentVerification, FXLookupOptions, X402RequestOptions } from './types/x402';
import type { RateLimitInfo } from './client';

// Context to hold the initialized SDK client
const ProofRailsContext = createContext<ProofRails | null>(null);

export interface ProofRailsProviderProps {
    apiKey?: string;
    config?: Omit<SDKConfig, 'apiKey'>;
    client?: ProofRails;
    children: React.ReactNode;
}

/**
 * ProofRails Provider
 * Wrap your application with this to use ProofRails hooks
 */
export const ProofRailsProvider: React.FC<ProofRailsProviderProps> = ({
    apiKey,
    config = {},
    client: clientProp,
    children,
}) => {
    const [client, setClient] = useState<ProofRails | null>(() => {
        if (clientProp) return clientProp;
        if (apiKey || config.baseUrl || config.network) {
            return new ProofRails({ apiKey, ...config });
        }
        return null;
    });

    const baseUrl = config.baseUrl;
    const network = config.network;
    const timeout = config.timeout;
    const retries = config.retries;
    const retryDelay = config.retryDelay;
    const adminToken = config.adminToken;
    const flareRpcUrl = config.flareRpcUrl;
    const privateKey = config.privateKey;

    useEffect(() => {
        if (clientProp) {
            setClient(clientProp);
            return;
        }
        const instance = new ProofRails({
            apiKey,
            ...config,
        });
        setClient(instance);
    }, [clientProp, apiKey, baseUrl, network, timeout, retries, retryDelay, adminToken, flareRpcUrl, privateKey]);

    if (!client) return null;

    return React.createElement(
        ProofRailsContext.Provider,
        { value: client },
        children
    );
};

/**
 * Hook to access the ProofRails client
 */
export const useProofRails = (): ProofRails => {
    const context = useContext(ProofRailsContext);
    if (!context) {
        throw new Error('useProofRails must be used within a ProofRailsProvider');
    }
    return context;
};

/**
 * Hook to handle payments via beginner-friendly templates
 */
export const useProofRailsPayment = () => {
    const client = useProofRails();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [receipt, setReceipt] = useState<Receipt | null>(null);

    const createPayment = async (options: {
        amount: number;
        from: string;
        to: string;
        purpose: string;
        transactionHash: string;
        chain?: string;
        currency?: string;
    }) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await client.templates.payment(options);
            setReceipt(result);
            return result;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Payment creation failed');
            setError(errorObj);
            throw errorObj;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createPayment,
        send: createPayment,
        receipt,
        isLoading,
        error,
    };
};

/**
 * Hook to fetch receipts list with pagination
 */
export const useReceipts = (initialOptions?: ListReceiptsOptions, sdkOverride?: ProofRails) => {
    const contextSdk = useContext(ProofRailsContext);
    const client = sdkOverride || contextSdk;

    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [pagination, setPagination] = useState<{ total: number; page: number; limit: number }>({
        total: 0,
        page: 1,
        limit: 20,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchReceipts = useCallback(async (options?: ListReceiptsOptions) => {
        if (!client) return;
        setLoading(true);
        setError(null);
        try {
            const result = await client.receipts.list(options || initialOptions);
            setReceipts(result.items || []);
            setPagination({
                total: result.total,
                page: result.page,
                limit: result.limit,
            });
            return result;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Unknown error fetching receipts');
            setError(errorObj);
            throw errorObj;
        } finally {
            setLoading(false);
        }
    }, [client, initialOptions]);

    useEffect(() => {
        if (client) {
            fetchReceipts(initialOptions).catch(() => {});
        }
    }, [client]);

    return {
        fetch: fetchReceipts,
        receipts,
        pagination,
        loading,
        error,
    };
};

/** Alias for useReceipts */
export const useReceiptsList = useReceipts;

/**
 * Hook to fetch single receipt details
 */
export const useReceipt = (receiptId?: string, sdkOverride?: ProofRails) => {
    const contextSdk = useContext(ProofRailsContext);
    const client = sdkOverride || contextSdk;

    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchReceipt = useCallback(async (id: string) => {
        if (!client) return;
        setLoading(true);
        setError(null);
        try {
            const result = await client.receipts.get(id);
            setReceipt(result);
            return result;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Error fetching receipt');
            setError(errorObj);
            throw errorObj;
        } finally {
            setLoading(false);
        }
    }, [client]);

    useEffect(() => {
        if (client && receiptId) {
            fetchReceipt(receiptId).catch(() => {});
        }
    }, [client, receiptId]);

    return {
        fetch: fetchReceipt,
        receipt,
        loading,
        error,
    };
};

/** Alias for useReceipt */
export const useReceiptDetails = useReceipt;

/**
 * Hook to verify a receipt on-chain
 */
export const useVerifyReceipt = (sdkOverride?: ProofRails) => {
    const contextSdk = useContext(ProofRailsContext);
    const client = sdkOverride || contextSdk;

    const [result, setResult] = useState<VerificationResult | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const verifyById = async (receiptId: string): Promise<VerificationResult> => {
        if (!client) throw new Error('ProofRails client not available');
        setIsVerifying(true);
        setError(null);
        try {
            const res = await client.verify.byReceiptId(receiptId);
            setResult(res);
            return res;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Verification failed');
            setError(errorObj);
            throw errorObj;
        } finally {
            setIsVerifying(false);
        }
    };

    const verifyByHash = async (bundleHash: string): Promise<VerificationResult> => {
        if (!client) throw new Error('ProofRails client not available');
        setIsVerifying(true);
        setError(null);
        try {
            const res = await client.verify.byHash(bundleHash);
            setResult(res);
            return res;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Verification failed');
            setError(errorObj);
            throw errorObj;
        } finally {
            setIsVerifying(false);
        }
    };

    return {
        verify: verifyById,
        verifyById,
        verifyByHash,
        result,
        isVerifying,
        error,
    };
};

/**
 * Hook to work with x402 payment proof headers and verifications
 */
export const useX402Payment = (sdkOverride?: ProofRails) => {
    const contextSdk = useContext(ProofRailsContext);
    const client = sdkOverride || contextSdk;

    const [isVerifying, setIsVerifying] = useState(false);
    const [verification, setVerification] = useState<X402PaymentVerification | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const getPaymentHeader = (payment: X402Payment) => {
        if (!client) throw new Error('ProofRails client not available');
        return client.x402.paymentHeader(payment);
    };

    const verifyPayment = async (payment: X402Payment) => {
        if (!client) throw new Error('ProofRails client not available');
        setIsVerifying(true);
        setError(null);
        try {
            const res = await client.x402.verifyPayment(payment);
            setVerification(res);
            return res;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Payment verification failed');
            setError(errorObj);
            throw errorObj;
        } finally {
            setIsVerifying(false);
        }
    };

    const premiumFxLookup = useCallback(async (options: FXLookupOptions = {}) => {
        if (!client) throw new Error('ProofRails client not available');
        return client.x402.premiumFxLookup(options);
    }, [client]);

    const fetchWithPayment = useCallback(async (endpoint: string, body?: unknown, options?: X402RequestOptions) => {
        if (!client) throw new Error('ProofRails client not available');
        return client.x402.fetchWithPayment(endpoint, body, options);
    }, [client]);

    return {
        getPaymentHeader,
        verifyPayment,
        premiumFxLookup,
        fetchWithPayment,
        verification,
        isVerifying,
        error,
    };
};

/** Hook to create project helper */
export const useCreateProject = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const create = async (options: { name?: string; label?: string; message: string; signature: string; network?: string }) => {
        setLoading(true);
        try {
            const result = await ProofRails.createProject(options);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create project'));
            throw err;
        } finally {
            setLoading(false);
        }
    };
    return { create, loading, error };
};

/** Hook for in-memory Form State Management (never stores secrets in localStorage) */
export const useProofRailsForm = (initialApiKey: string = '') => {
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');

    const resetForm = () => {
        setRecipient('');
        setAmount('');
        setPurpose('');
    };

    return {
        apiKey,
        setApiKey,
        recipient,
        setRecipient,
        amount,
        setAmount,
        purpose,
        setPurpose,
        resetForm,
    };
};

/** Hook for Rate Limit Info from response headers */
export const useRateLimitInfo = (sdkOverride?: ProofRails): RateLimitInfo | null => {
    const contextSdk = useContext(ProofRailsContext);
    const client = sdkOverride || contextSdk;

    if (!client) return null;
    return client.getClient().getRateLimitInfo();
};
