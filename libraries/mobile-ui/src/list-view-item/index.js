import { createNamespace } from '../utils';
import { ChildrenMixin } from '../mixins/relation';

import Iconv from '../iconv';

const [createComponent, bem] = createNamespace('list-view-item');

export default createComponent({
  mixins: [ChildrenMixin('vanListView')],
  props: {
    item: [Object, String, Number],
    value: [String, Number],
    selected: { type: Boolean, default: false },
    striped: { type: Boolean, default: false },
  },
  methods: {
    onTap() {
      this.$emit('select', {
        value: this.value,
        selected: this.selected,
        item: this.item,
      });
    },
  },
  render() {
    return (
      <div
        class={bem()}
        selected={this.selected}
        onClick={this.onTap}
        striped={this.striped}
      >
        <div class={bem('icon')}>
          {this.selected && this.parent.selectedIcon && (
            <Iconv name={this.parent.selectedIcon} icotype="only" />
          )}
          {!this.selected && this.parent.unselectedIcon && (
            <Iconv name={this.parent.unselectedIcon} icotype="only" />
          )}
        </div>

        {this.slots()}
      </div>
    );
  },
});
