import { useState, useCallback } from 'react';

/**
 * Lightweight Toast Hook for System Alerts
 */
export const useToast = () => {
    // Basic implementation since we lack a global ToastProvider in this context.
    // In a real app, this would use Context or Zustand. For now, we simulate it via native alerts
    // or you can hook it into your global toast manager later.
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        // Fallback to native console/alert if generic toast isn't available
        if (type === 'error') {
            console.error(`[Matrix Alert]: ${message}`);
            alert(`🛑 ${message}`);
        } else {
            console.log(`[Matrix Protocol]: ${message}`);
            // Let's not use alert for success to not block UX
        }
    }, []);

    return { showToast };
};
