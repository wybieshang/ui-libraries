import {
  describe,
  it,
  test,
  vi as jest,
  expect,
} from 'vitest';
import { snapshotDemo } from '../../../test/demo';

import BlocksDemo1 from '../demos/blocks/BlocksDemo1';
import Demo from '../demos';

// 基础blocks
snapshotDemo(BlocksDemo1);

// 渲染demo
snapshotDemo(Demo);
