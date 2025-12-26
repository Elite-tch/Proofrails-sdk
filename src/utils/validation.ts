/**
 * Validation helpers for common inputs
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validate Ethereum address
 */
export function validateAddress(address: string): ValidationResult {
    if (!address) {
        return { isValid: false, error: 'Address is required' };
    }

    if (typeof address !== 'string') {
        return { isValid: false, error: 'Address must be a string' };
    }

    // Check if it starts with 0x
    if (!address.startsWith('0x')) {
        return { isValid: false, error: 'Address must start with 0x' };
    }

    // Check if it's 42 characters long (0x + 40 hex chars)
    if (address.length !== 42) {
        return { isValid: false, error: 'Address must be 42 characters long (0x + 40 hex digits)' };
    }

    // Check if it contains only valid hex characters
    const hexRegex = /^0x[0-9a-fA-F]{40}$/;
    if (!hexRegex.test(address)) {
        return { isValid: false, error: 'Address contains invalid characters (must be hexadecimal)' };
    }

    return { isValid: true };
}

/**
 * Validate amount
 */
export function validateAmount(amount: string | number): ValidationResult {
    if (amount === '' || amount === null || amount === undefined) {
        return { isValid: false, error: 'Amount is required' };
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
        return { isValid: false, error: 'Amount must be a valid number' };
    }

    if (numAmount <= 0) {
        return { isValid: false, error: 'Amount must be greater than 0' };
    }

    if (numAmount > Number.MAX_SAFE_INTEGER) {
        return { isValid: false, error: 'Amount is too large' };
    }

    return { isValid: true };
}

/**
 * Validate transaction hash
 */
export function validateTransactionHash(hash: string): ValidationResult {
    if (!hash) {
        return { isValid: false, error: 'Transaction hash is required' };
    }

    if (typeof hash !== 'string') {
        return { isValid: false, error: 'Transaction hash must be a string' };
    }

    // Check if it starts with 0x
    if (!hash.startsWith('0x')) {
        return { isValid: false, error: 'Transaction hash must start with 0x' };
    }

    // Check if it's 66 characters long (0x + 64 hex chars)
    if (hash.length !== 66) {
        return { isValid: false, error: 'Transaction hash must be 66 characters long (0x + 64 hex digits)' };
    }

    // Check if it contains only valid hex characters
    const hexRegex = /^0x[0-9a-fA-F]{64}$/;
    if (!hexRegex.test(hash)) {
        return { isValid: false, error: 'Transaction hash contains invalid characters (must be hexadecimal)' };
    }

    return { isValid: true };
}

/**
 * Validate API key format
 */
export function validateApiKey(apiKey: string): ValidationResult {
    if (!apiKey) {
        return { isValid: false, error: 'API key is required' };
    }

    if (typeof apiKey !== 'string') {
        return { isValid: false, error: 'API key must be a string' };
    }

    if (apiKey.length < 10) {
        return { isValid: false, error: 'API key is too short' };
    }

    return { isValid: true };
}

/**
 * Validate purpose/reference text
 */
export function validatePurpose(purpose: string): ValidationResult {
    if (!purpose) {
        return { isValid: false, error: 'Purpose is required' };
    }

    if (typeof purpose !== 'string') {
        return { isValid: false, error: 'Purpose must be a string' };
    }

    if (purpose.trim().length === 0) {
        return { isValid: false, error: 'Purpose cannot be empty' };
    }

    if (purpose.length > 500) {
        return { isValid: false, error: 'Purpose is too long (max 500 characters)' };
    }

    return { isValid: true };
}

/**
 * Validate all payment fields at once
 */
export function validatePayment(params: {
    amount: string | number;
    to: string;
    purpose: string;
    transactionHash?: string;
}): ValidationResult {
    const amountCheck = validateAmount(params.amount);
    if (!amountCheck.isValid) return amountCheck;

    const addressCheck = validateAddress(params.to);
    if (!addressCheck.isValid) return addressCheck;

    const purposeCheck = validatePurpose(params.purpose);
    if (!purposeCheck.isValid) return purposeCheck;

    if (params.transactionHash) {
        const hashCheck = validateTransactionHash(params.transactionHash);
        if (!hashCheck.isValid) return hashCheck;
    }

    return { isValid: true };
}
