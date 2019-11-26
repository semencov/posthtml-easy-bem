const REG_BLOCK = /^[a-zA-Z]/;
const REG_ELEM = /^__?/;
const REG_MOD = /^--?/;

const any = (arr, fn = Boolean) => arr.some(fn);
const pipe = (...fns) => fns.reduce((f, g) => (...args) => g(f(...args)));
const isString = val => typeof val === 'string';
const isEmpty = val => val == null || !(Object.keys(val) || val).length;
const isArray = obj => obj != null && typeof obj[Symbol.iterator] === 'function';
const isBlock = str => str.match(REG_BLOCK);
const isElement = str => str.match(REG_ELEM);
const isMod = str => str.match(REG_MOD);

const getClassList = pipe(
  str => {
    if (!isString(str)) {
      throw new Error(
        'getClassList argument must be a string, ' + typeof str + ' given'
      );
    }
    return str;
  },
  str => str.split(/\s+/),
  arr => arr.filter(str => !isEmpty(str))
);

const createBlockClass = (classList = []) => {
  if (!isArray(classList)) {
    throw new Error(
      'createBlockClass argument must be an array, ' +
        typeof classList +
        ' given'
    );
  }

  return [...classList]
    .reverse()
    .reduce((a, b) => (b.match(REG_BLOCK) ? b : a));
};

const createElemClass = (blockClass, elemName, elemPrefix = '__') =>
  elemName.replace(REG_ELEM, blockClass + elemPrefix);

const createModClass = (baseClass, modName, modPrefix = '--') =>
  modName.replace(REG_MOD, baseClass + modPrefix);

const processElement = (baseClass, classList = [], elemPrefix = '__') => {
  if (!isArray(classList)) {
    throw new Error(
      'processElement second argument must be an array, ' +
        typeof classList +
        ' given'
    );
  }

  return classList
    .map(cls => isElement(cls) ? createElemClass(baseClass, cls, elemPrefix) : cls)
    .join(' ');
};

const processMods = (baseClass, classList, modPrefix = '--') =>
  classList
    .map(cls => (isMod(cls) ? createModClass(baseClass, cls, modPrefix) : cls))
    .join(' ');

const defaultConfig = {
  elemPrefix: '__',
  modPrefix: '--'
};

exports = {
  getClassList,
  createBlockClass,
  createElemClass,
  createModClass,
  processElement,
  processMods
};

exports.default = options => {
  let config = Object.assign(defaultConfig, options);

  return function posthtmlBem (tree) {
    tree.match({ attrs: { class: true } }, node => {
      let classList = getClassList(node.attrs.class);
      let block;

      if (any(classList, isBlock)) {
        block = createBlockClass(classList);

        if (node.content && isArray(node.content)) {
          node.content.forEach(child => {
            if (child.attrs && child.attrs.class) {
              let childClassList = getClassList(child.attrs.class);

              if (any(childClassList, isElement)) {
                child.attrs.class = processElement(block, childClassList, config.elemPrefix);
              }
            }
          });
        }
      }

      if (any(classList, isMod) && block) {
        node.attrs.class = processMods(block, classList, config.modPrefix);
      }

      return node;
    });

    return tree;
  };
};

module.exports = Object.assign(exports.default, exports);
