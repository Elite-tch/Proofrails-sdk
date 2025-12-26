/**
 * Embed module for generating embeddable widgets
 */

import type { APIClient } from '../client';

export interface EmbedOptions {
    theme?: 'light' | 'dark';
    width?: string;
    height?: string;
}

export interface WidgetResult {
    iframeHtml: string;
    embedUrl: string;
}

export class EmbedModule {
    constructor(private client: APIClient) { }

    widget(receiptId: string, options: EmbedOptions = {}): WidgetResult {
        const baseUrl = this.client.getBaseUrl();
        const theme = options.theme || 'light';
        const width = options.width || '100%';
        const height = options.height || '400px';

        const embedUrl = `${baseUrl}/embed/receipt?rid=${receiptId}&theme=${theme}`;

        const iframeHtml = `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" style="border: none;"></iframe>`;

        return {
            iframeHtml,
            embedUrl,
        };
    }

    fullPage(receiptId: string): string {
        const baseUrl = this.client.getBaseUrl();
        return `${baseUrl}/receipt/${receiptId}`;
    }
}
