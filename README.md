# dot-gitignore

## Usage

```js
var dotgit = new DotGitignore();
dotgit.ignore('node_modules/'); // true
dotgit.ignore('node_modules/find-up/index.js'); // true
dotgit.ignore('package.josn'); // false
```
