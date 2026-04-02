import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BasePageState from './base-page-state.vue'

describe('BasePageState', () => {
  it('renders loading and text content', () => {
    const wrapper = mount(BasePageState, {
      props: {
        loading: true,
        title: '加载中',
        description: '正在获取数据',
      },
    })

    expect(wrapper.text()).toContain('加载中')
    expect(wrapper.text()).toContain('正在获取数据')
    expect(wrapper.find('.page-state__spinner').exists()).toBe(true)
  })
})
