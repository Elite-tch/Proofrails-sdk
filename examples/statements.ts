/**
 * Statements generation examples
 */

import ProofRails from '../src';

async function statementsExamples() {
    const proofrails = new ProofRails({
        apiKey: 'your-api-key-here',
    });

    // Example 1: Generate intraday statement (camt.052)
    console.log('Example 1: Intraday Statement (camt.052)');
    const intradayStatement = await proofrails.statements.intraday({
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        accountId: 'my-account-123',
    });

    console.log('Statement type:', intradayStatement.type);
    console.log('Download URL:', intradayStatement.downloadUrl);
    console.log('Message ID:', intradayStatement.messageId);
    console.log('Created:', intradayStatement.createdAt);

    // Example 2: Generate end-of-day statement (camt.053)
    console.log('\nExample 2: End-of-Day Statement (camt.053)');
    const eodStatement = await proofrails.statements.endOfDay({
        dateTo: '2024-01-31',
        accountId: 'my-account-123',
    });

    console.log('Statement type:', eodStatement.type);
    console.log('Download URL:', eodStatement.downloadUrl);
    console.log('Message ID:', eodStatement.messageId);

    // Example 3: Generate statement for specific date range
    console.log('\nExample 3: Custom date range');
    const customStatement = await proofrails.statements.intraday({
        dateFrom: '2024-12-01',
        dateTo: '2024-12-18',
        accountId: 'project-account',
    });

    console.log('Download:', customStatement.downloadUrl);
}

statementsExamples().catch(console.error);
