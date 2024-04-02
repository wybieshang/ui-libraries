import { createNamespace } from '../utils';

const [createComponent, bem] = createNamespace('designer-slot-empty');

export default createComponent({

  render() {
    return (
      <div class={bem()} s-empty="true">
        +
      </div>
    );
  },
});
