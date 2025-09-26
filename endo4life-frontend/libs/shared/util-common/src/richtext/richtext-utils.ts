import { IRichText, RichtextBuilder } from '@endo4life/types';

export function isEmptyRichTextContent(value?: string) {
  if (!value || !value) return true;
  try {
    const editorState = JSON.parse(value);
    const children = editorState?.root?.children[0]?.children;
    if (children) {
      return children.length === 0;
    }
  } catch (error) {
    console.log('error', error);
  }
  return false;
}

export function stringToRichText(str?: string): IRichText | undefined {
  if (!str) return undefined;
  try {
    const jsonData = JSON.parse(str);
    if (jsonData && jsonData.hasOwnProperty('root')) {
      return { content: str };
    }
  } catch (error) {}
  return new RichtextBuilder(str).build();
}
