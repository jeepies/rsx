import { Clock, Medal, Plus, Target, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export default function XPCompetitions() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            {t('pages.xp_competition.title')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('pages.xp_competition.description')}</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('pages.xp_competition.create_competition')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-ful grid-cols-3">
          <TabsTrigger value="active">{t('pages.xp_competition.tabs.active.name')}</TabsTrigger>
          <TabsTrigger value="upcoming">{t('pages.xp_competition.tabs.upcoming.name')}</TabsTrigger>
          <TabsTrigger value="completed">
            {t('pages.xp_competition.tabs.completed.name')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">
              {t('pages.xp_competition.tabs.completed.error')}
            </h3>
            <p className="text-muted-foreground">{t('pages.xp_competition.check_back')}</p>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">
              {t('pages.xp_competition.tabs.upcoming.error')}
            </h3>
            <p className="text-muted-foreground">{t('pages.xp_competition.check_back')}</p>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="text-center py-12">
            <Medal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">
              {t('pages.xp_competition.tabs.completed.error')}
            </h3>
            <p className="text-muted-foreground">{t('pages.xp_competition.check_back')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
