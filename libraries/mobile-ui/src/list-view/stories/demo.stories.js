import Vue from 'vue';
import '__demo-entry__';
import ListView from '../index';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Example/list-view',
  component: ListView,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
  },
};

const dataSource = Array.from({ length: 100 }).map((_, i) => i + 1);

export const Demo1 = {
  name: '普通数据源',
  args: {
    dataSource,
  },
  render: (args) => ({
    components: {
      ListView,
    },
    setup() {
      return { args };
    },
    template: `
    <van-list-view
        v-bind="args"
      >
        <template #item="current">
          <van-cell :is-link="false">
            <template #title>
              <div>{{ current.item }}</div>
            </template>
          </van-cell>
        </template>
      </van-list-view>
  `,
  }),
};

export const Demo2 = {
         name: '普通数据源-筛选',
         args: {
           dataSource,
           filterable: true,
         },
         render: (args) => ({
           components: {
             ListView,
           },
           setup() {
             return { args };
           },
           template: `
      <van-list-view
         v-bind="args"
      >
        <template #item="current">
          <van-cell :is-link="false">
            <template #title>
              <div>{{ current.item }}</div>
            </template>
          </van-cell>
        </template>
      </van-list-view>
    `,
         }),
       };
