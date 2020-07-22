/*
判断文件路径是否被 .gitignore 排除

USAGE:

```js
var dotgit = new DotGitignore();
dotgit.ignore('node_modules/'); // true
dotgit.ignore('node_modules/find-up/index.js'); // true
dotgit.ignore('package.josn'); // false
```

CHANGELOG:

2020.4.9
- 从 <https://github.com/bcoe/dotgitignore> 克隆代码，并修改
- 新增 dirLine 逻辑，默认对 / 结尾的表达式增加 globstar(**) 表达式，以支持匹配 node_modules/xxx 的路径
- 新增 commentLine 标记注释行，并在后续的 filter 中去除注释
- 新增 patterns 数组，基于 .gitignore 转换得到的 glob pattern 储存在该数组中
- 修改成 class 语法
*/

// MIT License
// Bradley Meck
// https://github.com/bmeck/dotignore
import fs from 'fs';
import path from 'path';
import minimatch from 'minimatch';
import findUp from 'find-up';

const gitignoreFilename = '.gitignore';

class IgnoreMatcher {
  public patterns: string[] = []; // glob patterns
  public matchers: RegExp[] = [];
  public delimiter = path.sep;
  public negated: boolean[] = [];
  public rooted: boolean[] = [];

  constructor(gitignoreContent: string) {
    this.patterns = <string[]>gitignoreContent
      .split(/\r?\n|\r/)
      .map((line, idx) => {
        const emptyLine = line === '';
        const commentLine = line[0] === '#';

        if (emptyLine) {
          return null;
        }
        if (commentLine) {
          return null;
        }

        const negatedLine = line[0] === '!';
        const rootedLine = line[0] === '/';
        const isShellGlob = line.indexOf('/') >= 0;
        const dirLine = line[line.length - 1] === '/';

        if (negatedLine || rootedLine) {
          line = line.substring(1);
        }

        this.negated[idx] = negatedLine;
        this.rooted[idx] = rootedLine || isShellGlob;

        if (dirLine) {
          line += '**';
        }

        return line;
      })
      .filter((line) => line !== null);
    this.matchers = this.patterns.map((pattern) => minimatch.makeRe(pattern));
  }

  shouldIgnore(filename: string) {
    var isMatching = false;
    for (var i = 0; i < this.matchers.length; i++) {
      var matcher = this.matchers[i];
      if (this.rooted[i]) {
        if (matcher.test(filename)) {
          isMatching = !this.negated[i];
        }
      } else if (
        filename.split(this.delimiter).some(function (part) {
          return matcher.test(part);
        })
      ) {
        isMatching = !this.negated[i];
      }
    }
    return isMatching;
  }
}

class DotGitignore extends IgnoreMatcher {
  constructor(opts?: { cwd: string }) {
    const gitignorePath = findUp.sync(gitignoreFilename, opts);
    const content = gitignorePath ? fs.readFileSync(gitignorePath, 'utf8') : '';
    super(content);
  }
  ignore(name: string) {
    return this.shouldIgnore(name);
  }
}

export { IgnoreMatcher, DotGitignore };

export default DotGitignore;
