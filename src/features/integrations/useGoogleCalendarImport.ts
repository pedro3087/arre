import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../lib/firebase';
import { useAuth } from '../../lib/auth/AuthContext';

interface CalendarImportState {
  isConnected: boolean;
  isImporting: boolean;
  importError: string | null;
  lastSyncDate: string | null;
}

export function useGoogleCalendarImport(): CalendarImportState {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    async function runImport() {
      try {
        const integrationRef = doc(db, 'users', user!.uid, 'integrations', 'googleCalendar');
        const integrationSnap = await getDoc(integrationRef);

        if (!integrationSnap.exists()) {
          if (isMounted) setIsConnected(false);
          return;
        }

        if (isMounted) setIsConnected(true);

        const data = integrationSnap.data();
        if (data.lastSyncDate) {
          if (isMounted) setLastSyncDate(data.lastSyncDate);
        }

        if (isMounted) setIsImporting(true);

        const importFn = httpsCallable(functions, 'importGoogleCalendarEvents');
        const result = await importFn({});
        const resData = result.data as { imported: number; skipped: number; date: string };

        if (isMounted) {
          setLastSyncDate(resData.date);
          setImportError(null);
        }
      } catch (err: any) {
        console.error('[useGoogleCalendarImport] Import failed:', err);
        if (isMounted) {
          setImportError(err.message || 'Failed to import calendar events.');
        }
      } finally {
        if (isMounted) setIsImporting(false);
      }
    }

    runImport();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { isConnected, isImporting, importError, lastSyncDate };
}
