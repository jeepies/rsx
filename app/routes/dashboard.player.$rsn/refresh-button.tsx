import { useFetcher } from '@remix-run/react';
import { formatDistance } from 'date-fns';
import { t } from 'i18next';
import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import type { RefreshProfileResponse } from '~/~types/API';

export interface RefreshProfileButtonProps {
  username: string;
  refreshInfo: {
    refreshable: boolean;
    refreshable_at: Date | null;
  };
}

export default function RefreshProfileButton(props: Readonly<RefreshProfileButtonProps>) {
  const { username, refreshInfo } = props;
  const fetcher = useFetcher<RefreshProfileResponse>();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const shownToastRef = useRef(false);

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

  const now = new Date();

  return (
    <fetcher.Form method="post" action={`/api/refresh/${username}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 flex-1 sm:flex-none"
            type="submit"
            disabled={!refreshInfo.refreshable || isRefreshing}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isRefreshing
                ? t('pages.player_profile.refreshing')
                : t('pages.player_profile.refresh')}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {refreshInfo.refreshable
              ? t('pages.player_profile.refresh_tooltip')
              : formatDistance(now, refreshInfo.refreshable_at!, { includeSeconds: true })}
          </p>
        </TooltipContent>
      </Tooltip>
    </fetcher.Form>
  );
}
