import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

export function PlayerProfileSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
              <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-6 sm:h-8 w-48" />
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Skeleton className="h-9 w-20 flex-1 sm:flex-none" />
              <Skeleton className="h-9 w-20 flex-1 sm:flex-none" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 sm:space-y-6">
        <div className="grid w-full grid-cols-4 h-10">
          <Skeleton className="h-full rounded-r-none" />
          <Skeleton className="h-full rounded-none" />
          <Skeleton className="h-full rounded-none" />
          <Skeleton className="h-full rounded-l-none" />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-[300px] rounded" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-2 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="text-right space-y-1">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-28" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
