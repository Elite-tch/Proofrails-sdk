/**
 * Embedding examples - Generate widgets and URLs
 */

import ProofRails from '../src';

async function embeddingExamples() {
    const proofrails = new ProofRails({
        apiKey: 'your-api-key-here',
    });

    // Create a receipt
    const receipt = await proofrails.templates.payment({
        amount: 100,
        from: 'Alice',
        to: 'Bob',
        purpose: 'Test',
        transactionHash: '0x123',
    });

    console.log('Receipt created:', receipt.id);

    // Example 1: Generate embeddable widget (light theme)
    console.log('\nExample 1: Light theme widget');
    const lightWidget = proofrails.embed.widget(receipt.id, {
        theme: 'light',
        width: '100%',
        height: '500px',
    });

    console.log('Embed URL:', lightWidget.embedUrl);
    console.log('HTML to embed:');
    console.log(lightWidget.iframeHtml);

    // Example 2: Generate embeddable widget (dark theme)
    console.log('\nExample 2: Dark theme widget');
    const darkWidget = proofrails.embed.widget(receipt.id, {
        theme: 'dark',
        width: '800px',
        height: '600px',
    });

    console.log('Embed URL:', darkWidget.embedUrl);

    // Example 3: Full page URL
    console.log('\nExample 3: Full page URL');
    const fullPageUrl = proofrails.embed.fullPage(receipt.id);
    console.log('Full page:', fullPageUrl);

    // Example 4: Usage in HTML
    console.log('\nExample 4: HTML usage');
    console.log(`
<!-- Add this to your HTML -->
<div id="receipt-container">
  ${lightWidget.iframeHtml}
</div>

<!-- Or use JavaScript -->
<script>
  document.getElementById('receipt-container').innerHTML = '${lightWidget.iframeHtml.replace(/'/g, "\\'")}';
</script>
  `);
}

embeddingExamples().catch(console.error);
