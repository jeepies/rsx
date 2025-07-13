import { useFetcher } from '@remix-run/react';
import { formatDuration, intervalToDuration } from 'date-fns';
import { t } from 'i18next';
import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import type { RefreshProfileResponse } from '~/~types/API';

export interface RefreshProfileButtonProps {
  username: string;
  refreshInfo: number;
}

const MANUAL_REFRESH_COOLDOWN_MS = 5 * 60 * 1000;

export default function RefreshProfileButton(props: Readonly<RefreshProfileButtonProps>) {
  const { username, refreshInfo } = props;
  const fetcher = useFetcher<RefreshProfileResponse>();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const shownToastRef = useRef(false);

  const now = Date.now();
  const lastRefresh = refreshInfo || 0;

  const refreshable = now - lastRefresh >= MANUAL_REFRESH_COOLDOWN_MS;
  const refreshableAt = new Date(lastRefresh + MANUAL_REFRESH_COOLDOWN_MS);

  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setIsRefreshing(true);
      shownToastRef.current = false;
    }

    if (fetcher.state === 'idle' && fetcher.data && !shownToastRef.current) {
      shownToastRef.current = true;

      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);

      if (fetcher.data.success) {
        toast.success(t('pages.player_profile.refresh_success'));
      } else {
        toast.error(t('pages.player_profile.refresh_failed'));
      }
    }
  }, [fetcher.state, fetcher.data]);

  const remainingDuration = formatDuration(
    intervalToDuration({ start: new Date(), end: refreshableAt }),
    { format: ['minutes', 'seconds'] },
  );

  return (
    <fetcher.Form method="post" action={`/api/refresh/${username}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 flex-1 sm:flex-none"
              type="submit"
              disabled={!refreshable || isRefreshing}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isRefreshing
                  ? t('pages.player_profile.refreshing')
                  : t('pages.player_profile.refresh')}
              </span>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {refreshable
              ? t('pages.player_profile.refresh_tooltip')
              : `${t('pages.player_profile.refreshable_in')} ${remainingDuration}`}
          </p>
        </TooltipContent>
      </Tooltip>
    </fetcher.Form>
  );
}
