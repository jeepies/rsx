import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';

export interface Tag {
  label: string;
  imageSrc?: string;
}

interface TagsInputProps {
  name?: string;
  value?: Tag[];
  onChange?: (tags: Tag[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  validateTag?: (tag: string) => boolean;
  duplicateErrorMessage?: string;
}

export function TagsInput({
  name,
  value = [],
  onChange,
  placeholder = 'Add a tag...',
  maxTags,
  disabled = false,
  validateTag = (tag) => /^[\w\-]+$/.test(tag),
  duplicateErrorMessage = 'Duplicate tag',
}: TagsInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const addTag = (tagText: string) => {
    const trimmed = tagText.trim();
    if (!trimmed) return;

    if (!validateTag(trimmed)) {
      setError('Invalid tag format');
      return;
    }

    if (value.some((t) => t.label.toLowerCase() === trimmed.toLowerCase())) {
      setError(duplicateErrorMessage);
      return;
    }

    if (maxTags && value.length >= maxTags) {
      setError(`Maximum of ${maxTags} tags allowed`);
      return;
    }

    const newTag: Tag = { label: trimmed };
    onChange?.([...value, newTag]);
    setInput('');
    setError('');
  };

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange?.(newTags);
    setError('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ','].includes(e.key)) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[48px]">
        {value.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-muted rounded-full"
          >
            {tag.imageSrc && (
              <img
                src={tag.imageSrc}
                alt={tag.label}
                className="w-4 h-4 rounded-full object-cover"
              />
            )}
            <span>{tag.label}</span>
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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled}
        />
      </div>

      {name && <input type="hidden" name={name} value={value.map((t) => t.label).join(',')} />}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
