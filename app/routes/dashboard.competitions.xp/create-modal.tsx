import { X, Grid3X3, Trophy } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Tag, TagsInput } from '~/components/ui/tags-input';

export interface CreateXPModalProps {
  setter: Dispatch<SetStateAction<boolean>>;
}

export default function CreateXPModal(props: Readonly<CreateXPModalProps>) {
  const { t } = useTranslation();

  const key = 'pages.xp_competition.create_modal';

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    users?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const [data, setData] = useState<{
    name?: string;
    description?: string;
    users?: Tag[];
  }>({});

  const validateAndProceed = () => {
    switch (step) {
      case 0:
        const newErrors: {
          name?: string;
          description?: string;
          users?: string;
          grid_size?: string;
        } = {};

        setErrors(newErrors);
        if (Object.keys(newErrors).length !== 0) return;
        setStep(1);
        break;
    }
  };
  const renderStepOne = () => {
    return (
      <>
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => props.setter(false)}
            className="absolute right-1 top-1"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-txl">{t(`${key}.title`)}</CardTitle>
          <CardDescription>{t(`${key}.description`)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t(`${key}.step.${step}.name`)}</Label>
              <Input
                id="name"
                placeholder={t(`${key}.step.${step}.name_placeholder`)}
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
              {errors.name && <span className="text-red-500">{errors.name}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t(`${key}.step.${step}.description`)}</Label>
              <Input
                id="description"
                placeholder={t(`${key}.step.${step}.description_placeholder`)}
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
              />
              {errors.description && <span className="text-red-500">{errors.description}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="users">{t(`${key}.step.${step}.users`)}</Label>
              <TagsInput
                name="users"
                value={data.users}
                onChange={(newTags) => {
                  const transformedTags = newTags.map((tag) => ({
                    label: tag.label.trim(),
                    imageSrc: `https://secure.runescape.com/m=avatar-rs/${encodeURIComponent(tag.label.trim())}/chat.png`,
                  }));
                  setData({ ...data, users: transformedTags });
                }}
                placeholder={t(`${key}.step.${step}.users_placeholder`)}
              />
              {errors.users && <span className="text-red-500">{errors.users}</span>}
            </div>
          </div>
          <Button
            className="w-full"
            disabled={!data.name || !data.description}
            onClick={() => validateAndProceed()}
          >
            {t(`${key}.step.${step}.advance`)}
          </Button>
        </CardContent>
      </>
    );
  };

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl animate-scale-in">{step === 0 && renderStepOne()}</Card>
    </div>
  );
}
