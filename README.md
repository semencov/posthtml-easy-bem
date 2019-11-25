# PostHTML-easy-bem

[PostHTML](https://github.com/posthtml/posthtml) plugin for support to simplify the maintenance of [BEM](http://bem.info) naming structure. It is inspired with [posthtml-bem-sugar](https://github.com/Nitive/posthtml-bem-sugar) and [pug-bem](https://www.npmjs.com/package/pug-bem), but does not depend on other plugins. If you would like more complete and flexible solution, you should try [posthtml-bem](https://github.com/rajdee/posthtml-bem).


## Install

```
$ npm install --save-dev posthtml-easy-bem
```


## Features

### Blocks

Unlike [posthtml-bem-sugar](https://github.com/Nitive/posthtml-bem-sugar), this plugin uses unprefixed classes to detect blocks. So the block class will be untouched on output.

```html
<div class="MadTeaParty">
  March Hare
</div>
```


### Elements

Element classes uses `__` as a prefix.

```html
<div class="MadTeaParty">
  <div class="__march-hare">March Hare</div>
</div>
```

This would render like

```html
<div class="MadTeaParty">
  <div class="MadTeaParty__march-hare">March Hare</div>
</div>
```

### Modifiers

But modirier classes uses `--`.

```html
<div class="MadTeaParty">
  <div class="__march-hare --type_mad">
    March Hare
  </div>
  <div class="__march-hare --mad">
    March Hare
  </div>
</div>
```

This would render like

```html
<div class="MadTeaParty">
  <div class="MadTeaParty__march-hare MadTeaParty__march-hare--type_mad">
    March Hare
  </div>
  <div class="MadTeaParty__march-hare MadTeaParty__march-hare--mad">
    March Hare
  </div>
</div>
```


## Usage

```js
const posthtml = require('posthtml');

const html = [
  '<div class="MadTeaParty">',
  '  <div class="__march-hare --type_mad">March Hare</div>',
  '  <div class="__hatter --type_mad">Hatter</div>',
  '  <div class="__dormouse --state_sleepy">Dormouse</div>',
  '</div>'
].join('\n')

posthtml()
  .use(require('posthtml-easy-bem')())
  .process(html)
  .then(result => {
    console.log(result.html);
  });
```

## License

MIT
