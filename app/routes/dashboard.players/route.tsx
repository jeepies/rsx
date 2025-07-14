export async function loader({ request }: LoaderFunctionArgs) {
  const uniqueViews = await prisma.playerView.count({
    where: {
      playerId: meta!.id,
      viewedAt: {
        gte: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    },
  });
}

export default function Players() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Players</h1>
        <p className="text-muted-foreground">Discover popular RuneScape players and their stats</p>
      </div>
    </div>
  );
}
