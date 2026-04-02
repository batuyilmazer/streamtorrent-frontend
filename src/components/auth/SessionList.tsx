import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import type { MeSession } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionListProps {
  sessions: MeSession[];
}

function formatDate(date: string): string {
  try {
    return new Date(date).toLocaleString('tr-TR');
  } catch {
    return date;
  }
}

export function SessionList({ sessions }: SessionListProps) {
  const { logout } = useAuth();
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSessionLogout(sessionId: string) {
    setError(null);
    setPendingSessionId(sessionId);
    try {
      await logout();
    } catch (err) {
      setError(getErrorMessage(err, 'Çıkış yapılamadı.'));
    } finally {
      setPendingSessionId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktif Oturumlar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aktif oturum bulunamadı.</p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="rounded-lg border border-border p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Cihaz: {session.userAgent || 'Bilinmeyen cihaz'}
                  </p>
                  <p className="text-xs text-muted-foreground">IP: {session.ip || 'Bilinmiyor'}</p>
                  <p className="text-xs text-muted-foreground">
                    Bitiş: {formatDate(session.expiresAt)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSessionLogout(session.id)}
                  disabled={pendingSessionId === session.id}
                >
                  {pendingSessionId === session.id ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
