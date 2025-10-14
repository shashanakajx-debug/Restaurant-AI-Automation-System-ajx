import { useCallback } from 'react';
import * as apiUtils from '@/lib/utils/api';
// import { Message, UserPreference } from '@/types/ai';
import * as aiTypes from '@/types/ai';

// Define UserPreference type if not exported from '@/types/ai'
export interface UserPreference {
  // Add the properties as needed, for example:
  dietaryRestrictions?: string[];
  favoriteCuisines?: string[];
  allergies?: string[];
}

// Maximum number of retries for API requests
const MAX_RETRIES = 3;

interface UseChatOptions {
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

/**
 * Makes a fetch request with retry logic.
 * @param url The endpoint URL.
 * @param options Fetch options, plus optional maxRetries.
 * @returns The parsed JSON response.
 */
export async function fetchWithRetry(
    url: string,
    options: RequestInit & { maxRetries?: number }
): Promise<any> {
    const { maxRetries = 3, ...fetchOptions } = options;
    let attempt = 0;
    let lastError: any;

    while (attempt < maxRetries) {
        try {
            const res = await fetch(url, fetchOptions);
            const data = await res.json();

            if (res.ok) {
                return data;
            } else {
                lastError = data;
            }
        } catch (err) {
            lastError = err;
        }
        attempt++;
        // Optional: add a small delay between retries
        await new Promise(resolve => setTimeout(resolve, 300 * attempt));
    }

    throw new Error(
        lastError?.error || lastError?.message || 'API request failed after retries'
    );
}
