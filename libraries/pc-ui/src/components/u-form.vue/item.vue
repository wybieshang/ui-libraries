<template>
<div
  :class="$style.root"
  :label-size="currentLabelSize"
  :distance="rootVM && rootVM.extraSlots ? 'extra' : ''"
  :style="responsiveStyle"
  :label-layout="currentLabelLayout"
  :label-ellipsis="currentLabelEllipsis"
  :layout="layout"
>
    <label :class="$style.label" :required="required" :position="requiredPosition" v-show="label || title || $slots.label || currentLabelSize !== 'auto'" vusion-slot-name="label" vusion-slot-name-edit="label">
        <span :class="$style.text" vusion-slot-name-edit="label" v-ellipsis-title>
            <slot name="label">{{ label || title }}</slot>
            <s-empty
                v-if="!$slots.label
                    && !(label || title)
                    && $env.VUE_APP_DESIGNER
                    && !!$attrs['vusion-node-path']">
            </s-empty>
        </span>
    </label>
    <span :class="$style.extra" v-if="!hideSlots && rootVM && rootVM.extraSlots" vusion-slot-name="extra">
        <slot name="extra"></slot>
    </span>
    <div :class="[$style.field, $env.VUE_APP_DESIGNER ? $style.full : null]">
        <!-- 添加了描述功能 -->
        <div :class="$style.description" vusion-slot-name="description" vusion-slot-name-edit="description">
            <slot name="description">{{ description }}</slot>
        </div>
        <div :class="[$style.wrap, $env.VUE_APP_DESIGNER ? $style.full : null]" vusion-slot-name="default">
            <slot></slot>
            <s-empty v-if="(!$slots.default) && $env.VUE_APP_DESIGNER && !!$attrs['vusion-node-path']"></s-empty>
            <span v-if="color === 'focus' && currentMessage" :class="$style.message" color="focus"><slot name="message">{{ validateMessage || currentMessage }}</slot></span>
            <span v-else-if="currentMessage" :class="$style.message" :color="color" placement="bottom"><slot name="message">{{ validateMessage || currentMessage }}</slot></span>
            <span v-else-if="bubble && !mutedMessage && touched && !valid && firstError" :class="$style.message" color="error" placement="bottom">{{ firstError }}</span>
        </div>
    </div>
</div>
</template>

<script>
import UValidator from '../u-validator.vue';
import SEmpty from '../s-empty.vue';
import { MChild } from '../m-parent.vue';

export default {
    name: 'u-form-item',
    parentName: 'u-form',
    groupName: 'u-form-group',
    components: {
        SEmpty,
    },
    mixins: [UValidator, MChild],
    props: {
        // name: String,
        // label: String,
        title: String,
        // rules: Array,
        // ignoreRules: { type: Boolean, default: false },
        // message: String,
        layout: {
          type: String,
          default: 'center',
        },
        required: { type: Boolean, default: false },
        requiredPosition: { type: String, default: 'right' },
        labelSize: String,
        bubble: { type: Boolean, default: false },
        description: String,
        hideSlots: { type: Boolean, default: false },
        span: { type: [Number, String], default: 1 },
        labelLayout: String,
        labelEllipsis: { type: Boolean, default: false },
        validateMessage: { type: String, default: '' },
    },
    data() {
        return {
            currentSpan: this.span,
            // value: undefined,
            // state: '',
            // color: '',
            // currentMessage: this.message,
            // inputing: false,
            // parentVM: undefined,
            // fieldVM: undefined,
        };
    },
    computed: {
        currentLabelSize() {
            return (
                this.labelSize
                || (this.rootVM && this.rootVM.labelSize)
                || 'auto'
            );
        },
        responsiveStyle() {
            const style = this.getPercent(this.currentSpan);
            return style;
        },
        repeat() {
            return (
                (this.groupVM && this.groupVM.repeat)
                || (this.parentVM && this.parentVM.repeat)
            );
        },
        currentLabelLayout() {
            return (
                this.labelLayout
                || (this.groupVM && this.groupVM.labelLayout)
                || (this.rootVM && this.rootVM.labelLayout)
            );
        },
        currentLabelEllipsis() {
            return (
                this.labelEllipsis
                || (this.groupVM && this.groupVM.labelEllipsis)
                || (this.rootVM && this.rootVM.labelEllipsis)
            );
        },
        previewItem() {
            return (
                this.rootVM && this.rootVM.preview
            );
        },
    },
    watch: {
        span(span) {
            this.currentSpan = span;
        },
    },
    methods: {
        // onFocus() {
        //     this.color = 'focus';
        //     this.currentMessage = this.message;
        // },
        // onBlur() {
        //     this.color = this.state = '';
        //     this.$nextTick(() => this.validate('blur');
        // },
        getPercent(span) {
            if (this.repeat > 1) {
                return {
                    width: (span / this.repeat) * 100 + '%',
                    // 平台到制品应用nasl格式解析中，会有4px的空白字符存在于标签与标签之间.
                    'margin-left': -(4 * (this.repeat - 1) / this.repeat) + 'px',
                };
            }
            if (this.repeat > 0) {
                return {
                    width: (span / this.repeat) * 100 + '%',
                };
            }
        },
    },
};
</script>

<style module>
@import url("../u-validator.vue/index.css");

.root {
    position: relative;
    display: block;
}

.full {
    min-width: 100px;
}

.label {
    display: inline-block;
    width: var(--form-item-label-width);
    padding-right: var(--form-item-label-padding-right);
    color: var(--form-item-label-color);
    text-align: right;
    position: relative;
    max-width: 100%;
}

/* .label {
    display: inline-flex;
    width: var(--form-item-label-width);
    padding-right: var(--form-item-label-padding-right);
    color: var(--form-item-label-color);
    text-align: right;
    position: relative;
    align-items: var(--form-item-label-align-items);
    justify-content: var(--form-item-label-justify-content);
} */

.label .text {
    position: relative;
    display: inline-block;
    max-width: 100%;
    word-wrap: break-word;
    white-space: pre-wrap;
}

.label[required]::after {
    content: "*";
    color: var(--form-required-color);
    position: absolute;
    height: 12px;
    line-height: 12px;
    top: var(--form-required-top);
}

.label[required][position='left'] {
    padding-left: 10px;
}

.label[required][position='right']::after {
    right: var(--form-required-right);
}

.label[required][position='left']::after {
    /* left: calc(var(--form-item-label-padding-right) - var(--form-required-right)); */
    left: 0px;
}

.field {
    display: inline-block;
    position: relative;
}

.root[label-size$="mini"] > .label {
    width: var(--form-item-label-width-mini);
    padding-right: var(--form-item-label-padding-right-mini);
}
.root[label-size$="mini"] > .label[required][position='right']::after {
    right: var(--form-required-right-mini);
}
.root[label-size$="mini"] > .label[required][position='left']::after {
    /* left: calc(var(--form-required-right-mini) - var(--form-item-label-padding-right-mini)); */
    left: 0;
}
.root[label-size$="mini"] > .field {
    max-width: calc(100% - var(--form-item-label-width-mini));
}

.root[label-size$="small"] > .label {
    width: var(--form-item-label-width-small);
    padding-right: var(--form-item-label-padding-right-small);
}
.root[label-size$="small"] > .label[required][position='right']::after {
    right: var(--form-required-right-small);
}
.root[label-size$="small"] > .label[required][position='left']::after {
    /* left: calc(var(--form-required-right-small) - var(--form-item-label-padding-right-small)); */
    left: 0px;
}
.root[label-size$="small"] > .field {
    max-width: calc(100% - var(--form-item-label-width-small));
}

.root[label-size$="normal"] > .label {
    width: var(--form-item-label-width);
    padding-right: var(--form-item-label-padding-right);
}
.root[label-size$="normal"] > .label[required][position='right']::after {
    right: var(--form-required-right);
}
.root[label-size$="normal"] > .label[required][position='left']::after {
    /* left: calc(var(--form-required-right) - var(--form-item-label-padding-right)); */
    left: 0;
}
.root[label-size$="normal"] > .field {
    max-width: calc(100% - var(--form-item-label-width));
}

.root[label-size$="large"] > .label {
    width: var(--form-item-label-width-large);
    padding-right: var(--form-item-label-padding-right-large);
}
.root[label-size$="large"] > .label[required][position='right']::after {
    right: var(--form-required-right);
}
.root[label-size$="large"] > .label[required][position='left']::after {
    /* left: calc(var(--form-required-right-large) - var(--form-item-label-padding-right-large)); */
    left: 0;
}
.root[label-size$="large"] > .field {
    max-width: calc(100% - var(--form-item-label-width-large));
}

.root[field-size="full"] > .field {
    width: 100%;
}

.root[layout="block"] > .field {
    vertical-align: top;
}
.root[layout="center"] {
    display: flex;
    align-items: center;
}

.root[layout="center"] .label {
    flex-shrink: 0;
}

.root[layout="center"] .field {
    flex: 1;
}

.root[layout="center"] .wrap {
    width: 100%;
}

.root[layout="end"]{
    display: flex;
    align-items: flex-end;
}

.root[layout="none"] {
    display: inline-block;
}
.root[layout="none"] > .label {
    display: none;
}
.root[layout="none"] > .field {
    max-width: none;
}

.description {
    color: var(--color-light);
    margin-bottom: 10px;
}

.description:empty {
    display: none;
}

.wrap {
    position: relative;
    display: inline-block;
    max-width: 100%;
}

.root[field-size="full"] .wrap {
    display: block;
}

.extra {
    width: 24px;
    display: inline-block;
    position: relative;
    left: -12px;
}

.root[layout="block"][placement="right"] > .field > .wrap > .message {
    top: 0;
    transform: none;
}

.root[distance="extra"][label-size$="small"] > .field {
    max-width: calc(100% - 110px);
}
.root[distance="extra"][label-size$="normal"] > .field {
    max-width: calc(100% - 150px);
}
.root[distance="extra"][label-size$="large"] > .field {
    max-width: calc(100% - 190px);
}

.root div[class^="u-form-table-view"] {
    margin-top: -13px;
}

/* .root[label-layout="block"][layout="inline"] .item{
    display: inline-flex;
} */
.root[label-layout="block"] {
    display: block;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.root[label-layout="block"]:not(:last-child) {
    margin-bottom: var(--form-item-margin-bottom);
}

.root[label-layout="block"]> label{
    display: inline-flex;
    width: 100% !important;
    padding-right: 0;
    align-items: center;
    margin-bottom: 4px;
    justify-content: flex-start;
    text-align: left;
}
.root[label-layout="block"]> label[required]::after {
    position: initial;
    display: inline-block;
    margin-left: 4px;
    line-height: 16px;
}
.root[label-layout="block"]> label:empty{
    display: none;
}
.root[label-layout="block"]> [class^="u-form_item_field__"],
.root[label-layout="block"]> [class^="u-form_item_field__"] > [class^="u-form_item_wrap__"] {
    display: block;
    max-width: 100%;
    width: 100%;
}
.root[label-layout="block"]> label [s-empty="true"] {
    max-width: 90px;
}
.root[label-ellipsis] .label,
.root[label-ellipsis] .label span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.root[label-ellipsis] .label span {
  vertical-align: middle;
}
</style>
