import { Eye, EyeClosedIcon, Grid3X3, Lock, Pencil, User, Users, X } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Tag, TagsInput } from '~/components/ui/tags-input';
import { Drops, NormalizedDropsToDrops } from '~/~constants/Drops';

export interface CreateBingoModalProps {
  setter: Dispatch<SetStateAction<boolean>>;
}

export default function CreateBingoModal(props: Readonly<CreateBingoModalProps>) {
  const { t } = useTranslation();

  const key = 'pages.bingo_competition.create_modal';

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    users?: string;
    grid_size?: string;
  }>({});

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState<Tag[]>([]);
  const [gridSize, setGridSize] = useState('');

  const [password, setPassword] = useState('');
  const [canSeePassword, setCanSeePassword] = useState(false);

  const [editingId, setEditingId] = useState<number>(-1);
  const [items, setItems] = useState<{ [index: number]: string }>({});

  const validateAndProceed = () => {
    switch (step) {
      case 0:
        const newErrors: {
          name?: string;
          description?: string;
          users?: string;
          grid_size?: string;
        } = {};
        if (name.length < 1 || name.length > 18) {
          newErrors.name = t(`${key}.errors.name_length`);
        }
        if (description.length < 1 || description.length > 28) {
          newErrors.description = t(`${key}.errors.description_length`);
        }
        if (users.length === 0) {
          newErrors.users = t(`${key}.errors.users_length`);
        }
        if (!['2', '3', '4'].includes(gridSize)) {
          newErrors.grid_size = t(`${key}.errors.invalid_grid`);
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length !== 0) return;
        setStep(1);
        break;
      case 1:
        setStep(2);
        break;
    }
  };

  const generatePassword = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?@#$%^';
    let password = '';
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters[randomIndex];
    }
    return password;
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
            <Grid3X3 className="h-8 w-8 text-primary-foreground" />
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
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <span className="text-red-500">{errors.name}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t(`${key}.step.${step}.description`)}</Label>
              <Input
                id="description"
                placeholder={t(`${key}.step.${step}.description_placeholder`)}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && <span className="text-red-500">{errors.description}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="grid_size">{t(`${key}.step.${step}.grid_size`)}</Label>
              <Select value={gridSize} onValueChange={(value) => setGridSize(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t(`${key}.step.${step}.grid_size_placeholder`)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2x2</SelectItem>
                  <SelectItem value="3">3x3</SelectItem>
                  <SelectItem value="4">4x4</SelectItem>
                </SelectContent>
              </Select>
              {errors.grid_size && <span className="text-red-500">{errors.grid_size}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="users">{t(`${key}.step.${step}.users`)}</Label>
              <TagsInput
                name="users"
                value={users}
                onChange={(newTags) => {
                  const transformedTags = newTags.map((tag) => ({
                    label: tag.label.trim(),
                    imageSrc: `https://secure.runescape.com/m=avatar-rs/${encodeURIComponent(tag.label.trim())}/chat.png`,
                  }));
                  setUsers(transformedTags);
                }}
                placeholder={t(`${key}.step.${step}.users_placeholder`)}
              />
              {errors.users && <span className="text-red-500">{errors.users}</span>}
            </div>
          </div>
          <Button
            className="w-full"
            disabled={!name || !description}
            onClick={() => validateAndProceed()}
          >
            {t(`${key}.step.${step}.advance`)}
          </Button>
        </CardContent>
      </>
    );
  };

  const renderStepTwo = () => {
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
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-txl">{t(`${key}.title`)}</CardTitle>
          <CardDescription>{t(`${key}.description`)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t(`${key}.step.${step}.password`)}</Label>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  placeholder={t(`${key}.step.${step}.password_placeholder`)}
                  value={password}
                  type={canSeePassword ? 'text' : 'password'}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button variant="ghost" onClick={() => setCanSeePassword(!canSeePassword)}>
                  {canSeePassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeClosedIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="text-muted-foreground text-sm">
                    {t(`${key}.step.${step}.password_notice`)}
                  </span>
                </div>
                <span
                  className="text-muted-foreground text-sm cursor-pointer"
                  onClick={() => {
                    setPassword(generatePassword());
                  }}
                >
                  {t(`${key}.step.${step}.generate`)}
                </span>
              </div>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={!name || !description}
            onClick={() => validateAndProceed()}
          >
            {t(`${key}.step.${step}.advance`)}
          </Button>
        </CardContent>
      </>
    );
  };

  const renderStepThree = () => {
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
            <Pencil className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-txl">{t(`${key}.title`)}</CardTitle>
          <CardDescription>{t(`${key}.description`)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: Number(gridSize) * Number(gridSize) }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square p-2 text-xs border-2 rounded-lg flex flex-col items-center justify-center text-center transition-smooth border-muted-foreground/20 bg-muted/50 text-muted-foreground hover:bg-muted"
                  onClick={() => {
                    setEditingId(i);
                    setStep(-1);
                  }}
                >
                    {NormalizedDropsToDrops[items[i]]}
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" disabled={!name || !description} onClick={() => setStep(3)}>
            {t(`${key}.step.${step}.advance`)}
          </Button>
        </CardContent>
      </>
    );
  };

  const renderItemPicker = () => {
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
            <Pencil className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-txl">{t(`${key}.title`)}</CardTitle>
          <CardDescription>{t(`${key}.description`)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="item">{t(`${key}.step.item_picker.item`)}</Label>
            <Select
              value={items[editingId]}
              onValueChange={(value) => setItems((prev) => ({ ...prev, [editingId]: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t(`${key}.step.item_picker.item_placeholder`)} />
              </SelectTrigger>
              <SelectContent>
                {Drops.map((drop) => (
                  <SelectItem
                    value={drop
                      .toLowerCase()
                      .replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '')
                      .replace(/\s+/g, '_')}
                  >
                    {drop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            disabled={!name || !description}
            onClick={() => {
              setEditingId(-1);
              setStep(2);
            }}
          >
            {t(`${key}.step.item_picker.advance`)}
          </Button>
        </CardContent>
      </>
    );
  };

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl animate-scale-in">
        {editingId !== -1 && renderItemPicker()}
        {step === 0 && renderStepOne()}
        {step === 1 && renderStepTwo()}
        {step === 2 && renderStepThree()}
      </Card>
    </div>
  );
}
