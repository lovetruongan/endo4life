import * as yup from 'yup';
export interface IRichText {
  // Lexical State String
  content: string;
  // Raw text string
  text?: string;
}

export const richtextSchema = yup.object({
  content: yup.string(),
  text: yup.string().optional(),
});

export interface IRichtextBuilder {
  setContent(data: string): IRichtextBuilder;
  clear(): IRichtextBuilder;
  build(): IRichText;
}

export class RichtextBuilder implements IRichtextBuilder {
  private _state: any = {
    root: {
      children: [],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };

  constructor(content: string) {
    this._state.root.children.push({
      children: [
        {
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: content ?? '',
          type: 'text',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1,
    });
  }

  setContent(content: string): IRichtextBuilder {
    this._state.root.children.clear();
    this._state.root.children.push({
      children: [
        {
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: content ?? '',
          type: 'text',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1,
    });
    return this;
  }

  clear(): IRichtextBuilder {
    this._state.root.children.clear();
    return this;
  }
  build(): IRichText {
    return {
      content: JSON.stringify(this._state),
    };
  }
}
