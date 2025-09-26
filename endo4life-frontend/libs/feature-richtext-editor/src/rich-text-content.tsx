import { createEditor } from 'lexical';
import { useEffect, useState } from 'react';
import { $generateHtmlFromNodes } from '@lexical/html';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import { IRichText } from '@endo4life/types';

interface Props {
  value?: IRichText;
  inline?: boolean;
  className?: string;
}
export function RichTextContent({ value, inline, className }: Props) {
  const [htmlStr, setHtmlStr] = useState('');
  useEffect(() => {
    try {
      if (!value || value.content?.trim().length === 0) return;
      const editor = createEditor({
        nodes: [...PlaygroundNodes],
        theme: PlaygroundEditorTheme,
      });
      const state = editor.parseEditorState(value.content);
      editor.setEditorState(state);
      editor.update(() => {
        try {
          const str = $generateHtmlFromNodes(editor, null);
          if (inline) {
            const inlineStr = str.substring(
              str.indexOf('>') + 1,
              str.lastIndexOf('<'),
            );
            setHtmlStr(inlineStr);
          } else {
            setHtmlStr(str);
          }
        } catch (error) {
          console.log(error);
        }
      });
    } catch (error) {
      setHtmlStr(value?.content ?? '');
    }
  }, [value, inline]);
  if (!value) return null;
  if (inline)
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: htmlStr }}
      />
    );
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: htmlStr }} />
  );
}

export default RichTextContent;
