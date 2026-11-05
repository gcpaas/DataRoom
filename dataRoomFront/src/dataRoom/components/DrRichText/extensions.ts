import StarterKit from '@tiptap/starter-kit'
import { TextStyle, Color, FontFamily, FontSize } from '@tiptap/extension-text-style'
import { isSafeRichTextLink } from './rich-text-template'

/** 编辑与展示共用同一套 schema，避免保存后丢失字体或 marks。 */
export const createRichTextExtensions = () => [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    bulletList: false,
    orderedList: false,
    listItem: false,
    listKeymap: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    link: {
      openOnClick: false,
      autolink: false,
      linkOnPaste: false,
      isAllowedUri: isSafeRichTextLink,
      HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
    },
  }),
  TextStyle,
  Color,
  FontFamily,
  FontSize,
]
