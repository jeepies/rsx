import { User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

export default function LoginOverlay() {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-10 flex items-center justify-center p-4">
      <Card className="w=full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{t('auth.login_required')}</CardTitle>
          <CardDescription>{t('auth.login_required_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Login</Button>
        </CardContent>
      </Card>
    </div>
  );
}
