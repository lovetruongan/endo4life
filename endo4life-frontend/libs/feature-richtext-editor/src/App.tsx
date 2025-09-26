/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { LexicalComposer } from '@lexical/react/LexicalComposer';

import { SettingsContext } from './context/SettingsContext';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import Editor from './Editor';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import { TableContext } from './plugins/TablePlugin';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import { useRef, useState } from 'react';
import './styles.css';
import { Settings } from './appSettings';
import { v4 } from 'uuid';

function getDefaultContent(value?: string) {
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
              text: value ?? '',
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
  return JSON.stringify(state);
}

function getEditorState(value?: string) {
  if (!value || value.trim().length === 0) {
    return getDefaultContent(value);
  }
  try {
    const state = JSON.parse(value);
    if (state && Object.prototype.hasOwnProperty.call(state, 'root')) {
      return value;
    }
  } catch (error) {
    console.log('getEditorState Error', error);
  }
  return getDefaultContent(value);
}

interface RichTextEditorProps {
  name?: string;
  value?: string;
  width?: number | string;
  onChange?(value: string): void;
  autofocus?: boolean;
  placeholder?: string;
  options?: Partial<Settings>;
}
function Main({
  name = v4(),
  value,
  width,
  onChange,
  autofocus,
  placeholder,
}: RichTextEditorProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  const [initialConfig] = useState({
    editorState: getEditorState(value),
    namespace: name,
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  });

  return (
    <div ref={containerRef} style={{ width: width ?? '100%' }}>
      <LexicalComposer initialConfig={initialConfig}>
        <SharedHistoryContext>
          <TableContext>
            <div className="lexical-editor">
              <div className="editor-shell">
                <Editor
                  onChange={onChange}
                  autofocus={autofocus}
                  placeholder={placeholder}
                />
              </div>
            </div>
          </TableContext>
        </SharedHistoryContext>
      </LexicalComposer>
    </div>
  );
}

export function RichTextEditor(props: RichTextEditorProps): JSX.Element {
  const { options, ...remainProps } = props;
  return (
    <SettingsContext options={props.options}>
      <Main {...remainProps} />
    </SettingsContext>
  );
}
