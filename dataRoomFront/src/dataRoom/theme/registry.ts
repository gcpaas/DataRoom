import { obsidianGold } from './presets/obsidian-gold'
import { clearSea } from './presets/clear-sea'
import { castSilver } from './presets/cast-silver'
import { beaconRed } from './presets/beacon-red'
import { starportBlue } from './presets/starport-blue'
import { emberOrange } from './presets/ember-orange'
import { nightPurple } from './presets/night-purple'
import { forestGreen } from './presets/forest-green'
import { clearWhite } from './presets/clear-white'
import type { PageType } from '../constants/PageType'

export const themes = [starportBlue, emberOrange, nightPurple, forestGreen, clearWhite, obsidianGold, clearSea, castSilver, beaconRed] as const

// 兼容已保存的旧主题标识；页面下次切换时保存新标识。
const legacyThemeIds: Readonly<Record<string, string>> = {
  'light-business': 'clear-white',
  'dark-tech': 'starport-blue',
  'blue-ocean': 'starport-blue',
}
export const getTheme = (id?: string) => themes.find(theme => theme.id === (id ? legacyThemeIds[id] ?? id : undefined))
export const getDefaultTheme = (pageType: PageType) => pageType === 'page' ? clearWhite : starportBlue
