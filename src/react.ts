import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProofRails } from './index';
import type { SDKConfig } from './types/common';

// Context to hold the initialized SDK client
const ProofRailsContext = createContext<ProofRails | null>(null);

export interface ProofRailsProviderProps {
    apiKey?: string;
    config?: Omit<SDKConfig, 'apiKey'>;
    children: React.ReactNode;
}

/**
 * ProofRails Provider
 * Wrap your application with this to use ProofRails hooks
 */
export const ProofRailsProvider: React.FC<ProofRailsProviderProps> = ({
    apiKey,
    config = {},
    children
}) => {
    const [client, setClient] = useState<ProofRails | null>(null);

    useEffect(() => {
        // Initialize the client
        const instance = new ProofRails({
            apiKey,
            ...config,
        });
        setClient(instance);
    }, [apiKey]);

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
 * Hook to handle payments
 * Matches your usage: import { useProofRailsPayment } ...
 */
export const useProofRailsPayment = () => {
    const client = useProofRails();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [receipt, setReceipt] = useState<any | null>(null);

    const createPayment = async (options: {
        amount: number;
        from: string;
        to: string;
        purpose: string;
        transactionHash: string;
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
        send: createPayment, // Alias to match docs
        receipt,
        isLoading,
        error
    };
};

/** Hook to fetch receipts list */
export const useReceiptsList = (sdkOverride?: ProofRails) => {
    const contextSdk = useContext(ProofRailsContext);
    const client = sdkOverride || contextSdk;

    const [receipts, setReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async (options?: any) => {
        if (!client) return;
        setLoading(true);
        setError(null);
        try {
            // Support passing options to list() if SDK module supports it
            // Assuming client.receipts.list(options)
            const result = await client.receipts.list(options);
            setReceipts(Array.isArray(result) ? result : (result as any).items || []);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error fetching receipts'));
        } finally {
            setLoading(false);
        }
    };

    return { fetch, receipts, loading, error };
};

/** Hook to fetch single receipt details */
export const useReceiptDetails = (sdkOverride?: ProofRails) => {
    const contextSdk = useContext(ProofRailsContext);
    const client = sdkOverride || contextSdk;

    const [receipt, setReceipt] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetch = async (id: string) => {
        if (!client) return;
        setLoading(true);
        setError(null);
        try {
            const result = await client.receipts.get(id);
            setReceipt(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Error fetching receipt'));
        } finally {
            setLoading(false);
        }
    };

    return { fetch, receipt, loading, error };
};

/** Hook to create project helper */
export const useCreateProject = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const create = async (label: string, network?: string) => {
        setLoading(true);
        try {
            // Type cast network to any or specific type if needed
            const result = await ProofRails.createProject({ label, network: network as any });
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

/** Hook for Form State Management (matches docs) */
export const useProofRailsForm = () => {
    const [apiKey, setApiKeyState] = useState('');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');

    // Load API Key from local storage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('proofrails_api_key');
            if (saved) setApiKeyState(saved);
        }
    }, []);

    // Save API key when it changes
    const setApiKey = (key: string) => {
        setApiKeyState(key);
        if (typeof window !== 'undefined') {
            localStorage.setItem('proofrails_api_key', key);
        }
    };

    const resetForm = () => {
        setRecipient('');
        setAmount('');
        setPurpose('');
    };

    return {
        apiKey, setApiKey,
        recipient, setRecipient,
        amount, setAmount,
        purpose, setPurpose,
        resetForm
    };
};

/** Hook for Rate Limit Info (Mock/Placeholder) */
export const useRateLimitInfo = (sdkOverride?: ProofRails) => {
    // Current SDK doesn't openly expose rate limit headers yet easily
    // Returning dummy info to prevent crash
    return {
        limit: 1000,
        remaining: 999,
        reset: Date.now() + 3600000
    };
};
