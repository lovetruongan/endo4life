import { RichTextContent } from '@endo4life/feature-richtext-editor';
import { IRichText } from '@endo4life/types';
import { FormInputRichText } from '@endo4life/ui-common';
import { isEmptyRichTextContent } from '@endo4life/util-common';
import {
  useClickAway,
  useDebounce,
  useDeepCompareEffect,
  useMount,
} from 'ahooks';
import { MouseEvent, useRef, useState } from 'react';

interface Props {
  value?: IRichText;
  onChange(value?: IRichText): void;
  placeholder?: string;
  className?: string;
}

export function EditableRichText({
  value,
  placeholder,
  className,
  onChange,
}: Props) {
  const [editing, setEditing] = useState(
    isEmptyRichTextContent(value?.content),
  );
  const editingContainerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(value);
  const [loaded, setLoaded] = useState(false);
  const debounceContent = useDebounce(content, { wait: 250 });

  const onClickEdit = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setEditing(true);
  };

  useMount(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 100);
  });

  useClickAway(() => {
    if (loaded && editing) {
      setEditing(false);
    }
  }, editingContainerRef);

  useDeepCompareEffect(() => {
    if (JSON.stringify(debounceContent) !== JSON.stringify(value)) {
      onChange && onChange(debounceContent);
    }
  }, [value, debounceContent, onChange]);

  return (
    <div className={className}>
      {!editing && (
        <div onClick={onClickEdit} className="flex-auto cursor-pointer min-h-4">
          {!isEmptyRichTextContent(content?.content) && (
            <RichTextContent value={content} />
          )}
          {isEmptyRichTextContent(content?.content) && (
            <span className="text-sm italic cursor-pointer text-slate-300">
              {placeholder}
            </span>
          )}
        </div>
      )}
      {editing && (
        <div ref={editingContainerRef} className="flex-auto">
          <FormInputRichText
            autofocus
            placeholder={placeholder}
            value={value?.content}
            onChange={(val) => setContent({ content: val || '' })}
          />
        </div>
      )}
    </div>
  );
}
