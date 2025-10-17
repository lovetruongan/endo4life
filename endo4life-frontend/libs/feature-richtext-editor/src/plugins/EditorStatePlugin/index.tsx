import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

function string2EditorState(value?: string) {
  const state = {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: value ?? ' ',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
  return state;
}

function getEditorState(value?: string) {
  if (value) {
    try {
      const state = JSON.parse(value);
      if (state && Object.prototype.hasOwnProperty.call(state, 'root')) {
        return value;
      }
    } catch (error) {
      console.log('getEditorStateError', error);
    }
  }
  return JSON.stringify(string2EditorState(value));
}

export function EditorStatePlugin({ value }: { value?: string }): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    try {
      const state = getEditorState(value);
      const editorState = editor.parseEditorState(state);
      editor.setEditorState(editorState);
    } catch (error) {
      console.log('ParseStateError', error);
    }
  }, [editor, value]);

  return null;
}
