import type { DrRichTextConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

export const DrRichTextThemeMapping = [['color', 'text.primary']] as const satisfies ThemeMapping<DrRichTextConfig['props']>
