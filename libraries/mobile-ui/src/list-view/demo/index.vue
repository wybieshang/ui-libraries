<template>
  <demo-section>
    <demo-block title="基础用法">
      <van-list-view
        :data-source="data"
      >
        <template #item="current">
          <van-cell :is-link="false">
            <template #title>
              <div>{{ current.item }}</div>
            </template>
          </van-cell>
        </template>
      </van-list-view>
    </demo-block>

    <demo-block title="基础用法--筛选">
      <van-list-view
        :data-source="data"
        :filterable="true"
      >
        <template #item="current">
          <van-cell :is-link="false">
            <template #title>
              <div>{{ current.item }}</div>
            </template>
          </van-cell>
        </template>
      </van-list-view>
    </demo-block>

    <demo-block title="基础用法--下拉刷新">
      <van-list-view
        :data-source="fetchData"
        :pull-refresh="true"
      >
        <template #item="current">
          <van-cell :is-link="false">
            <template #title>
              <div>{{ current.item }}</div>
            </template>
          </van-cell>
        </template>
      </van-list-view>
    </demo-block>

    <demo-block title="基础用法--自动加载更多">
      <van-list-view
        :data-source="fetchData"
        :pull-refresh="true"
        pulling-text="自定义下拉刷新文案"
        loosing-text="自定义释放刷新文案"
        success-text="自定义刷新成功文案"
        :success-duration="1000"
        pageable="auto-more"
        :pageSize="20"
        @before-load="onBeforeLoad"
        @load="onLoad"

        style="--van-list-view-height: auto;"
      >
        <template #item="current">
          <van-cell :is-link="false">
            <template #title>
              <div>{{ current.item }}</div>
            </template>
          </van-cell>
        </template>
      </van-list-view>
    </demo-block>

    <demo-block title="基础用法--点击加载更多">
      <van-list-view
        :data-source="fetchData"
        :pull-refresh="true"
        pageable="load-more"
        :pageSize="20"
      >
        <template #item="current">
          <van-cell :is-link="false">
            <template #title>
              <div>{{ current.item }}</div>
            </template>
          </van-cell>
        </template>
      </van-list-view>
    </demo-block>

    <demo-block title="基础用法--分页器">
      <van-list-view
        :data-source="fetchData"
        pageable="pagination"
        :pageSize="20"
      >
        <template #item="current">
          <van-cell :is-link="false">
            <template #title>
              <div>{{ current.item }}</div>
            </template>
          </van-cell>
        </template>

        <template #prev>
            上一页
        </template>
        <template #next>
            下一页
        </template>
      </van-list-view>
    </demo-block>

    <demo-block title="基础用法--斑马纹">
      <van-list-view
        :data-source="data"
        striped
      >
        <template #item="current">
          <van-cell>
            <template #title>
              <div>{{ current.item }}</div>
            </template>
          </van-cell>
        </template>
      </van-list-view>
    </demo-block>

    <demo-block title="基础用法--单选">
      <van-list-view
        :data-source="data"
        :value.sync="value"
        selectedIcon="success"
        style="--van-list-view-item-selected-backgroud: red; --van-list-view-item-selected-icon-color: white;"
        @input="onInput"
        @select="onSelect"
        @change="onChange"
      >
        <template #item="current">
          <van-cell :is-link="false">
            <template #title>
              <div>{{ current.item }}</div>
            </template>
          </van-cell>
        </template>
      </van-list-view>
    </demo-block>

    <demo-block title="基础用法--多选">
      <van-list-view
        :data-source="data"
        :value.sync="multipleValue"
        multiple
        selectedIcon="success"
        style="--van-list-view-item-selected-backgroud: red; --van-list-view-item-selected-icon-color: white;"
        @input="onInput"
        @select="onSelect"
        @change="onChange"
      >
        <template #item="current">
          <van-cell :is-link="false">
            <template #title>
              <div>{{ current.item }}</div>
            </template>
          </van-cell>
        </template>
      </van-list-view>
    </demo-block>



  </demo-section>
</template>

<script>
export default {
  data() {
    return {
      data: Array.from({ length: 100 }).map((_, i) => i + 1),
      value: '',
      multipleValue: [],
    }
  },
  methods: {
    fetchData(params) {
      const { page, size } = params;
      console.log('params', params);
      const data = Array.from({ length: 100 }).map((_, i) => i + 1);
      const len = data.length;

      const result = {
        total: len,
        list: data.slice((page - 1) * size, page * size),
      }
      console.log('result', result);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(result)
        }, 1000)
      })
    },
    onBeforeLoad(event) {
      console.log('onBeforeLoad');
      // event.preventDefault();
    },
    onLoad(event) {
      console.log('onLoad');
    },
    onInput(value) {
      console.log('onInput', value);
    },
    onSelect(value) {
      console.log('onSelect', value);
    },
    onChange(value) {
      console.log('onChange', value);
    }
  }
}
</script>
