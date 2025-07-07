import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';

export interface Tag {
  label: string;
  imageSrc?: string;
}

interface TagsInputProps {
  value?: Tag[];
  onChange?: (tags: Tag[]) => void;
  placeholder?: string;
  name?: string;
  maxTags?: number;
  disabled?: boolean;
  validateTag?: (tag: string) => boolean;
  duplicateErrorMessage?: string;
}

export function TagsInput({
  value = [],
  onChange,
  placeholder = 'Add a tag...',
  name,
  maxTags,
  disabled = false,
  validateTag,
  duplicateErrorMessage = 'Duplicate tag',
}: TagsInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addTag = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    if (value.some((t) => t.label.toLowerCase() === trimmed.toLowerCase())) {
      setError(duplicateErrorMessage);
      return;
    }

    if (validateTag && !validateTag(trimmed)) {
      setError('Invalid tag');
      return;
    }

    if (maxTags && value.length >= maxTags) return;

    const newTag: Tag = {
      label: trimmed,
      imageSrc: `https://secure.runescape.com/m=avatar-rs/${encodeURIComponent(trimmed)}/chat.png`,
    };

    setError(null);
    onChange?.([...value, newTag]);
    setInput('');
  };

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange?.(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[48px]">
        {value.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-2 py-1 text-sm bg-muted rounded-full"
          >
            {tag.imageSrc && (
              <img src={tag.imageSrc} alt={tag.label} className="w-4 h-4 rounded-full" />
            )}
            {tag.label}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => removeTag(index)}
              className="h-4 w-4 p-0 hover:text-destructive"
              disabled={disabled}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}

        <Input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled}
          name={name}
        />
      </div>
      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  );
}
