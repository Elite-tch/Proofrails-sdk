/**
 * User-friendly error messages and helpers
 */

export interface FriendlyError {
    title: string;
    message: string;
    solution?: string;
    learnMore?: string;
}

export function getFriendlyError(error: any): FriendlyError {
    const errorMsg = error?.message || error?.detail || String(error);
    const statusCode = error?.statusCode || error?.status;

    // Database/Uniqueness errors
    if (errorMsg.includes('UNIQUE constraint') || errorMsg.includes('already exists')) {
        return {
            title: '❌ Duplicate Receipt',
            message: 'A receipt with this transaction hash already exists.',
            solution: 'This transaction has already been recorded. Check your receipts list.',
            learnMore: 'https://docs.proofrails.com/errors/duplicate'
        };
    }

    // Insufficient funds (middleware wallet)
    if (errorMsg.includes('insufficient funds') || errorMsg.includes('gas')) {
        return {
            title: '❌ Middleware Wallet Needs Funding',
            message: 'Your ProofRails middleware wallet doesn\'t have enough tokens to pay gas fees.',
            solution: 'Send 0.5-1.0 C2FLR tokens to your middleware wallet address (check your .env ANCHOR_PRIVATE_KEY).',
            learnMore: 'https://docs.proofrails.com/setup/funding'
        };
    }

    // Network/Connection errors
    if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('ECONNREFUSED')) {
        return {
            title: '❌ Cannot Connect to Middleware',
            message: 'Unable to reach the ProofRails middleware server.',
            solution: 'Make sure your middleware is running on the correct port (default: 8000). Check your baseUrl configuration.',
            learnMore: 'https://docs.proofrails.com/troubleshooting/connection'
        };
    }

    // Timeout errors
    if (errorMsg.includes('timeout') || errorMsg.includes('TIMEOUT')) {
        return {
            title: '⏱️ Request Timed Out',
            message: 'The middleware took too long to respond.',
            solution: 'The middleware might be processing a large request or experiencing issues. Try again in a moment.',
            learnMore: 'https://docs.proofrails.com/troubleshooting/timeout'
        };
    }

    // Authentication errors
    if (statusCode === 401 || statusCode === 403 || errorMsg.includes('unauthorized') || errorMsg.includes('forbidden')) {
        return {
            title: '🔐 Authentication Failed',
            message: 'Your API key is invalid or missing.',
            solution: 'Check that you\'ve set your API key correctly. You can create a new one using ProofRails.createProject().',
            learnMore: 'https://docs.proofrails.com/setup/api-keys'
        };
    }

    // Not found errors
    if (statusCode === 404 || errorMsg.includes('not found')) {
        return {
            title: '🔍 Not Found',
            message: 'The requested resource doesn\'t exist.',
            solution: 'Double-check the receipt ID or resource identifier you\'re trying to access.',
            learnMore: 'https://docs.proofrails.com/troubleshooting/not-found'
        };
    }

    // Validation errors
    if (statusCode === 422 || errorMsg.includes('validation') || errorMsg.includes('invalid')) {
        return {
            title: '⚠️ Invalid Data',
            message: 'The data you provided is invalid or incomplete.',
            solution: 'Check that all required fields are filled correctly (amount, addresses, transaction hash, etc.).',
            learnMore: 'https://docs.proofrails.com/api/validation'
        };
    }

    // Server errors
    if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
        return {
            title: '🔧 Server Error',
            message: 'The middleware encountered an internal error.',
            solution: 'Check the middleware logs for details. The issue might be with database access or blockchain connectivity.',
            learnMore: 'https://docs.proofrails.com/troubleshooting/server-errors'
        };
    }

    // Generic fallback
    return {
        title: '❌ Error',
        message: errorMsg,
        solution: 'If this error persists, please check the documentation or contact support.',
        learnMore: 'https://docs.proofrails.com/troubleshooting'
    };
}

export function formatErrorForDisplay(error: any): string {
    const friendly = getFriendlyError(error);
    let output = `${friendly.title}\n${friendly.message}`;

    if (friendly.solution) {
        output += `\n\n💡 Solution: ${friendly.solution}`;
    }

    if (friendly.learnMore) {
        output += `\n📖 Learn more: ${friendly.learnMore}`;
    }

    return output;
}
