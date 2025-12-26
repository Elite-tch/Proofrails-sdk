/**
 * Events module for live updates
 */

import type { APIClient } from '../client';
import type { ReceiptUpdate } from '../types/receipt';

export interface EventListener {
    stop: () => void;
}

export class EventsModule {
    constructor(private client: APIClient) { }

    listen(receiptId: string, callback: (update: ReceiptUpdate) => void): EventListener {
        const baseUrl = this.client.getBaseUrl();
        const url = `${baseUrl}/v1/iso/events/${receiptId}`;

        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                callback({
                    id: receiptId,
                    status: data.status,
                    anchorTx: data.anchor_tx || data.anchorTx,
                    bundleHash: data.bundle_hash || data.bundleHash,
                    timestamp: data.timestamp || new Date().toISOString(),
                });
            } catch (error) {
                console.error('Failed to parse SSE event:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            eventSource.close();
        };

        return {
            stop: () => eventSource.close(),
        };
    }
}
