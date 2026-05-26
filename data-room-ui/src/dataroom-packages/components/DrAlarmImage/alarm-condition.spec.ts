import {
  matchAlarmCondition,
  resolveAlarmImageItem,
  type AlarmImageItem,
} from './alarm-condition'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const items: AlarmImageItem[] = [
  {
    id: 'normal',
    name: '正常',
    url: '/normal.png',
    condition: '',
    enabled: true,
  },
  {
    id: 'warning',
    name: '预警',
    url: '/warning.png',
    condition: '100 > x > 90',
    enabled: true,
  },
  {
    id: 'danger',
    name: '异常',
    url: '/danger.png',
    condition: 'x >= 100',
    enabled: true,
  },
]

assert(matchAlarmCondition('100 > x > 90', 95), 'should match open interval expression')
assert(!matchAlarmCondition('100 > x > 90', 100), 'should exclude open upper boundary')
assert(!matchAlarmCondition('100 > x > 90', 90), 'should exclude open lower boundary')
assert(matchAlarmCondition('100 >= x >= 90', 100), 'should include upper boundary with >=')
assert(matchAlarmCondition('100 >= x >= 90', 90), 'should include lower boundary with >=')
assert(matchAlarmCondition('x > 90', 91), 'should match right-side greater-than expression')
assert(matchAlarmCondition('x <= 100', 100), 'should match right-side less-than-or-equal expression')
assert(matchAlarmCondition('90 < x', 91), 'should match left-side less-than expression')
assert(matchAlarmCondition('100 >= x', 100), 'should match left-side greater-than-or-equal expression')
assert(!matchAlarmCondition('abc', 95), 'should reject invalid expression')
assert(!matchAlarmCondition('', 95), 'should reject empty expression')
assert(!matchAlarmCondition('100 > x > 90', 'not-a-number'), 'should reject non-numeric values')

assert(
  resolveAlarmImageItem({ items, defaultItemId: 'normal', value: 95 })?.id === 'warning',
  'should select first matching warning item',
)
assert(
  resolveAlarmImageItem({ items, defaultItemId: 'normal', value: 100 })?.id === 'danger',
  'should select danger item when threshold is reached',
)
assert(
  resolveAlarmImageItem({ items, defaultItemId: 'normal', value: 80 })?.id === 'normal',
  'should fall back to configured default item',
)
assert(
  resolveAlarmImageItem({
    items: [{ ...items[1]!, enabled: false }],
    defaultItemId: 'missing',
    value: 95,
  })?.id === undefined,
  'should return undefined when no enabled item can be used',
)
assert(
  resolveAlarmImageItem({
    items: [
      { ...items[0]!, enabled: true },
      { ...items[1]!, condition: 'x > 90', enabled: true },
      { ...items[2]!, condition: 'x > 90', enabled: true },
    ],
    defaultItemId: 'normal',
    value: 95,
  })?.id === 'warning',
  'should prefer the first matching enabled rule',
)
