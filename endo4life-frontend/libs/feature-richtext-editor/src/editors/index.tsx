import { LexicalEditor, createEditor } from 'lexical';
import { v4 } from 'uuid';
import PlaygroundNodes from '../nodes/PlaygroundNodes';
import PlaygroundEditorTheme from '../themes/PlaygroundEditorTheme';

export function createLexicalEditor(name = v4()): LexicalEditor {
  const editor = createEditor({
    namespace: name,
    nodes: [...PlaygroundNodes],
    theme: PlaygroundEditorTheme,
  });
  return editor;
}

let __DEFAULT_LEXICAL_EDITOR__: LexicalEditor;
export function getDefaultLexcialEditor() {
  if (__DEFAULT_LEXICAL_EDITOR__ === undefined) {
    __DEFAULT_LEXICAL_EDITOR__ = createLexicalEditor(
      '__DEFAULT_LEXICAL_EDITOR__'
    );
  }
  return __DEFAULT_LEXICAL_EDITOR__;
}
