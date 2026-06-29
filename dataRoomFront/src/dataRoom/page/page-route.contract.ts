/// <reference types="node" />

import test from 'node:test'
import assert from 'node:assert/strict'

import { PageType } from '../constants/PageType.ts'
import { PageStatus } from '../constants/PageStatus.ts'
import { getPageDesignPath, getPagePreviewPath } from './page-route.ts'

test('builds designer paths for page cards', () => {
  assert.equal(getPageDesignPath({ code: 'screen-1', pageType: PageType.VISUAL_SCREEN }), '/dataRoom/visualScreenDesigner/screen-1')
  assert.equal(getPageDesignPath({ code: 'page-1', pageType: PageType.PAGE }), '/dataRoom/pageDesigner/page-1')
  assert.equal(getPageDesignPath({ code: 'dir-1', pageType: PageType.DIRECTORY }), '')
})

test('builds preview paths for page cards', () => {
  assert.equal(
    getPagePreviewPath({ code: 'screen-1', pageType: PageType.VISUAL_SCREEN }),
    `/dataRoom/visualScreenPreview/${PageStatus.PUBLISHED}/screen-1`,
  )
  assert.equal(getPagePreviewPath({ code: 'page-1', pageType: PageType.PAGE }), `/dataRoom/pagePreviewer/${PageStatus.PUBLISHED}/page-1`)
  assert.equal(getPagePreviewPath({ code: 'dir-1', pageType: PageType.DIRECTORY }), '')
})
