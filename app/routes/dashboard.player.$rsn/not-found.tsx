import { UserX } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';

export default function PlayerNotFound(
  props: Readonly<{
    RSN: string;
  }>,
) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto animate-fade-in">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center p-2">
              <UserX className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl mb-2">Player Not Found</CardTitle>
          <CardDescription className="text-base">
            {props.RSN ? (
              <>
                We couldn't find a player named "
                <span className="font-semibold text-foreground">{props.RSN}</span>"
              </>
            ) : (
              'The requested player could not be found'
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
