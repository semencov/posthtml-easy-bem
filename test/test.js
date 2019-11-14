const posthtml = require('posthtml');

const plugin = require('../src');
const {
  getClassList,
  createBlockClass,
  createElemClass,
  createModClass,
  processElement,
  processMods
} = plugin;

const testCreator = ({ defaults = {} } = {}) =>
  (discription, input, output, config = {}) => {
    test(discription, done => {
      const resultConfig = Object.assign(defaults, config);
      const plugins = [plugin(resultConfig)];

      plugins.reduce((processor, plugin) => processor.use(plugin), posthtml())
        .process(input)
        .then(result => {
          expect(result.html).toBe(output);
          done();
        })
        .catch(done);
    });
  };

const defaults = {
  elemPrefix: '__',
  modPrefix: '--'
};

const testFn = testCreator({ defaults });

describe('getClassList', () => {
  test('should throws if angument is not a string', () => {
    expect(() => getClassList([123])).toThrow();
  });

  test('should right process emtry string', () => {
    expect(getClassList('')).toEqual([]);
  });

  test('should right process one class', () => {
    expect(getClassList('class')).toEqual(['class']);
  });

  test('should right process few classes', () => {
    expect(getClassList('some classes')).toEqual(['some', 'classes']);
  });

  test('should right process extra spaces', () => {
    expect(getClassList('some  classes')).toEqual(['some', 'classes']);
    expect(getClassList('   some  classes   ')).toEqual(['some', 'classes']);
  });

  test('should right process falsy values', () => {
    expect(getClassList('0 false null undefined')).toEqual(['0', 'false', 'null', 'undefined']);
  });
});

describe('createBlockClass', () => {
  test('should throw exception', () => {
    expect(() => createBlockClass()).toThrow();
    expect(() => createBlockClass([])).toThrow();
  });

  test('should return single class name', () => {
    expect(createBlockClass(['block'])).toBe('block');
    expect(createBlockClass(['block', 'another-class'])).toBe('block');
    expect(createBlockClass(['--mod', 'block', 'another-class'])).toBe('block');
    expect(createBlockClass(['__elem', 'block', 'another-class'])).toBe('block');
  });
});

describe('createElemClass', () => {
  let block = 'block';

  test('should throw exception', () => {
    expect(() => createBlockClass()).toThrow();
    expect(() => createBlockClass([])).toThrow();
  });

  test('should return prefixed class name', () => {
    expect(createElemClass(block, '_element')).toEqual('block__element');
    expect(createElemClass(block, '__element')).toEqual('block__element');
    expect(createElemClass(block, '__element', '--')).toEqual('block--element');
  });
});

describe('createModClass', () => {
  let block = 'block';

  test('should return prefixed class name', () => {
    expect(() => createModClass()).toThrow();
    expect(() => createModClass([])).toThrow();
    expect(createModClass(block, '-mod')).toEqual('block--mod');
    expect(createModClass(block, '--mod')).toEqual('block--mod');
    expect(createModClass(block, '--mod', '__')).toEqual('block__mod');
  });
});

describe('processElem', () => {
  let block = 'block';
  let prefix = '__';

  test('should return string with element class', () => {
    expect(processElement(block, ['_element'])).toEqual('block__element');
    expect(processElement(block, ['_element'], '--')).toEqual('block--element');
    expect(processElement(block, ['_element', 'some-class', 'another'])).toEqual('block__element some-class another');
    expect(processElement(block, ['some-class', '_element', 'another'])).toEqual('some-class block__element another');
    expect(processElement(block, ['_element', '-some-mod', 'another'])).toEqual('block__element -some-mod another');
  });
});

describe('processMods', () => {
  let block = 'block';
  let prefix = '--';

  test('should return string with mods class', () => {
    expect(processMods(block, ['-mod'])).toEqual('block--mod');
    expect(processMods(block, ['-mod'], '__')).toEqual('block__mod');
    expect(processMods(block, ['-mod1', '-mod2', 'another'])).toEqual('block--mod1 block--mod2 another');
  });
});

describe('element', () => {
  testFn(
    'should change prefixed class to suffix',
    `<div class="block">
      <div class="__element"></div>
    </div>`,
    `<div class="block">
      <div class="block__element"></div>
    </div>`
  );

  testFn(
    'should keep another classes',
    `<div class="block">
      <div class="__element another-class and-more"></div>
    </div>`,
    `<div class="block">
      <div class="block__element another-class and-more"></div>
    </div>`
  );

  testFn(
    'should works with mods',
    `<div class="block">
      <div class="__element -disabled --red"></div>
    </div>`,
    `<div class="block">
      <div class="block__element block__element--disabled block__element--red"></div>
    </div>`
  );

  testFn(
    'should works with nested elements',
    `<div class="block">
      <div class="__element">
        <div class="__subelement"></div>
      </div>
    </div>`,
    `<div class="block">
      <div class="block__element">
        <div class="block__element__subelement"></div>
      </div>
    </div>`
  );
});

describe('mods', () => {
  testFn(
    'should change prefixed class to suffix',
    '<div class="someblock -mod-value"></div>',
    '<div class="someblock someblock--mod-value"></div>'
  );

  testFn(
    'should works with both - and --',
    '<div class="blk -bold --red"></div>',
    '<div class="blk blk--bold blk--red"></div>'
  );

  testFn(
    'should keep another classes',
    '<div class="blk -mod another-class and-more"></div>',
    '<div class="blk blk--mod another-class and-more"></div>'
  );
});

describe('full', () => {
  testFn(
    'should compile block',
    '<div class="block">my block</div>',
    '<div class="block">my block</div>'
  );

  testFn(
    'should compile block with multiple elements',
    `<div class="block -simple">
      <p class="paragraph">my block</p>
    </div>
    <div class="otherblock">
      <div class="__element">
        <div class="__subelement">content</div>
      </div>
    </div>
    <div class="block">
      <div class="__element">
        <div class="__subelement">content</div>
      </div>
    </div>`,
    `<div class="block block--simple">
      <p class="paragraph">my block</p>
    </div>
    <div class="otherblock">
      <div class="otherblock__element">
        <div class="otherblock__element__subelement">content</div>
      </div>
    </div>
    <div class="block">
      <div class="block__element">
        <div class="block__element__subelement">content</div>
      </div>
    </div>`
  );

  testFn(
    'should compile mods',
    `<div class="block -single">
      <div class="_element -value">content</div>
    </div>`,
    `<div class="block block--single">
      <div class="block__element block__element--value">content</div>
    </div>`
  );
});
