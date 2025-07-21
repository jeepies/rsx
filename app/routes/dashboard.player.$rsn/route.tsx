import { LoaderFunctionArgs } from '@remix-run/node';
import {
  isRouteErrorResponse,
  MetaFunction,
  useLoaderData,
  useNavigation,
  useParams,
  useRevalidator,
  useRouteError,
} from '@remix-run/react';
import PlayerNotFound from './not-found';
import { Card, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  getDailyLevelIncreases,
  getDailyXpIncreases,
  getPlayerStatus,
  getTrackedDaysByUsername,
  getWeeklyXpByDay,
} from '~/~models/player.server';
import { prisma } from '~/~services/prisma.server';
import { sanitizeBigInts } from '~/lib/utils';
import { PlayerData } from '~/~types/PlayerData';
import { RuneMetrics, Runescape } from '~/~services/runescape.server';
import Header from './header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import OverviewTab from './tabs/overview';
import SkillTab from './tabs/skills';
import QuestsTab from './tabs/quests';
import { useState, useRef, useEffect } from 'react';
import { PlayerProfileSkeleton } from './skeleton';
import { useTranslation } from 'react-i18next';
import { PlayerDataFetcher } from '~/~models/data-fetcher.server';

export const meta: MetaFunction = () => {
  const params = useParams();
  const rsn = params.rsn ?? 'Player';
  return [
    { title: `${rsn} | RSX` },
    {
      name: 'description',
      content: `View ${rsn}'s Runescape 3 stats, progress, and profile on RSX.`,
    },
    { property: 'og:title', content: `${rsn} | RSX` },
    {
      property: 'og:description',
      content: `View ${rsn}'s Runescape 3 stats, progress, and profile on RSX.`,
    },
    { property: 'og:type', content: 'profile' },
    { property: 'og:image', content: 'https://rsx.lol/logo.png' },
    { property: 'og:url', content: 'https://rsx.lol' },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) throw new Response('Missing RSN', { status: 400 });

  let fetcher = await PlayerDataFetcher.instance(rsn);
  if (!fetcher)
    throw new Response('Failed to fetch profile. Is this user private/non-existent?', {
      status: 404,
    });
  const data = await fetcher.getFreshestData();

  const meta = await prisma.player.findUnique({
    where: {
      username: rsn,
    },
  });

  const player: PlayerData = sanitizeBigInts(data);

  const [weeklyXp, dailyXP, dailyLevels, daysTracked, refreshInfo, status] = await Promise.all([
    getWeeklyXpByDay(rsn),
    getDailyXpIncreases(rsn),
    getDailyLevelIncreases(rsn),
    getTrackedDaysByUsername(rsn),
    fetcher.getLastRefresh(),
    getPlayerStatus(rsn),
  ]);

  const clanName = (await Runescape.getPlayerClanName(rsn)) ?? 'N/A';

  const ip =
    request.headers.get('x-forwarded-for') ??
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (ip !== 'unknown') {
    const twentyFourHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);

    const recentView = await prisma.playerView.findFirst({
      where: {
        playerId: meta!.id,
        ip,
        viewedAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    if (!recentView) {
      await prisma.playerView.create({
        data: {
          playerId: meta!.id,
          ip,
        },
      });
    }
  }

  return {
    player,
    status,
    refreshInfo,
    stats: {
      weeklyXp,
      dailyXP,
      dailyLevels,
      daysTracked,
    },
    clan: {
      clanName,
    },
    meta,
    chatheadURI: RuneMetrics.getChatheadURI(rsn),
  };
}

export default function PlayerProfile() {
  const { t } = useTranslation();
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const revalidator = useRevalidator();
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const isNavigatingToSamePlayerRoute =
    navigation.location?.pathname.startsWith('/player/') &&
    params.rsn &&
    navigation.location.pathname.toLowerCase().includes(params.rsn.toLowerCase());
  const shouldShowSkeletonLoading = isLoading && isNavigatingToSamePlayerRoute;
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMinTimeElapsed(false);
    timerRef.current = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [shouldShowSkeletonLoading]);
  const showSkeleton = shouldShowSkeletonLoading || !minTimeElapsed || !data;

  if (showSkeleton) {
    return <PlayerProfileSkeleton />;
  }

  if (!data) {
    return <PlayerNotFound RSN={params.rsn || ''} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Header data={data} onSuccessfulRefresh={() => revalidator.revalidate()} />

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
            {t('pages.player_profile.tabs.overview.name')}
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs sm:text-sm py-2">
            {t('pages.player_profile.tabs.skills.name')}
          </TabsTrigger>
          <TabsTrigger value="quests" className="text-xs sm:text-sm py-2">
            {t('pages.player_profile.tabs.quests.name')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <OverviewTab data={data} />
        </TabsContent>

        <TabsContent value="skills" className="space-y-4 sm:space-y-6">
          <SkillTab data={data} />
        </TabsContent>

        <TabsContent value="quests" className="space-y-4 sm:space-y-6">
          <QuestsTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <PlayerNotFound RSN={error.statusText || ''} />;
    }
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg mx-auto animate-fade-in">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl mb-2">Error {error.status}</CardTitle>
            <CardDescription className="text-base">Something went wrong.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto animate-fade-in">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl mb-2">Unexpected Error</CardTitle>
          <CardDescription className="text-base">An unexpected error occurred.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
