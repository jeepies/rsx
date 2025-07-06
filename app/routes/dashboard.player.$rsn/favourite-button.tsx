import { Heart } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useFavourites } from '~/contexts/favourites';

interface FavouriteButtonProps {
  RSN: string;
}

export default function FavouriteProfileButton(props: Readonly<FavouriteButtonProps>) {
  const { favourites, addFavourite, removeFavourite } = useFavourites();

  const isFavourite = favourites.some((f) => f === props.RSN);

  function toggleFavourite() {
    if (isFavourite) removeFavourite(props.RSN);
    else addFavourite(props.RSN);
  }

  return (
    <Button
      onClick={() => toggleFavourite()}
      variant={isFavourite ? 'default' : 'outline'}
      size="sm"
      className="flex items-center gap-2 flex-1 sm:flex-none"
    >
      <Heart className={`h-4 w-4 ${isFavourite ? 'fill-current' : ''}`} />
      <span className="hidden sm:inline">{isFavourite ? 'Favourited' : 'Favorite'}</span>
    </Button>
  );
}
