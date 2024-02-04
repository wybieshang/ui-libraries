<template>
  <demo-section>
    <demo-block title="基础用法--文本">
      <van-fieldinput
        type="text"
        placeholder="请输入"
      >
      </van-fieldinput>
    </demo-block>

    <demo-block title="基础用法--密码">
      <van-fieldinput
        type="password"
        placeholder="请输入"
      >
      </van-fieldinput>
    </demo-block>

    <demo-block title="基础用法--整数">
      <van-fieldinput
        type="integer"
        placeholder="请输入"
      >
      </van-fieldinput>
    </demo-block>

    <demo-block title="基础用法--随机整数">
      <van-fieldinput
        type="rndinteger"
        placeholder="请输入"
      >
      </van-fieldinput>
    </demo-block>

    <demo-block title="基础用法--小数">
      <van-fieldinput
        type="point"
        placeholder="请输入"
      >
      </van-fieldinput>
    </demo-block>

    <demo-block title="基础用法--身份证">
      <van-fieldinput
        type="card"
        placeholder="请输入"
      >
      </van-fieldinput>
    </demo-block>

    <demo-block title="定制键盘">
      <van-fieldinput
        type="text"
        keytheme="custom"
        placeholder="请输入"
        keyboard-title="键盘标题"
        keyboard-theme="custom"
        confirm-size="large"
        confirm-text="确定"
      >
      </van-fieldinput>
    </demo-block>

    <demo-block title="可清除">
      <van-fieldinput
        type="text"
        placeholder="请输入"
        :clearable="true"
      >
      </van-fieldinput>
    </demo-block>

    <demo-block title="格子输入框--文本">
      <van-fieldinput
        inputstyle="password"
        type="text"
        placeholder="请输入"
      >
      </van-fieldinput>
    </demo-block>

    <demo-block title="格子输入框--密码">
      <van-fieldinput
        inputstyle="password"
        type="password"
        placeholder="请输入"
      >
      </van-fieldinput>
    </demo-block>

    <demo-block title="格子输入框--整数">
      <van-fieldinput
        inputstyle="password"
        type="integer"
        placeholder="请输入"
      >
      </van-fieldinput>
    </demo-block>
  </demo-section>
</template>

<script>
export default {

}
</script>
