const fs = require('fs');
const glob = require('glob');
const stylelint = require('stylelint');

const ignorePatterns = fs.readFileSync('./.stylelintignore', 'utf8').split('\n');

const ignoreOptions = {
  ignore: ignorePatterns,
};

const lintOptions = {
  files: glob.sync('./**/*.css', ignoreOptions),
  config: {
    extends: 'stylelint-config-standard'
  }
};

stylelint.lint(lintOptions).then((result) => {
  result.results.forEach((res) => {
    const { source, warnings } = res;
    if (!warnings.length) {
      return;
    }
    const fileContents = fs.readFileSync(source, 'utf8').split('\n');
    const errorsByLine = {};
    warnings.forEach((warning) => {
      const { line, text } = warning;
      errorsByLine[line] = errorsByLine[line] || [];
      errorsByLine[line].push(text);
    });
    Object.keys(errorsByLine).forEach((lineNumber) => {
      const lineIndex = lineNumber - 1;
      const errorMessages = errorsByLine[lineNumber].join('; ');
      const errorLine = `${lineIndex + 1}: ${fileContents[lineIndex].trim()}`;
      const ignoreDirective = `/* stylelint-disable-next-line ${errorMessages} */`;
      fileContents.splice(lineIndex, 1, errorLine, ignoreDirective);
    });
    fs.writeFileSync(source, fileContents.join('\n'), 'utf8');
  });
  // Очистить файл .stylelintignore
  fs.writeFileSync('./.stylelintignore', '', 'utf8');
  console.log('Код успешно отформатирован!');
}).catch(error => {
  console.error(error);
});
