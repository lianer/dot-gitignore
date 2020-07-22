# dot-gitignore

## Usage

.gitignore
```
node_modules/
```

```js
var dotgit = new DotGitignore();
dotgit.ignore('node_modules/'); // true
dotgit.ignore('node_modules/find-up/index.js'); // true
dotgit.ignore('package.josn'); // false
```
