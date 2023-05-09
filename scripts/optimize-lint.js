const fs = require('fs');
const stylelint = require('stylelint');

const fileContents = fs.readFileSync('./.stylelintignore', 'utf8').split('\n');
let optimizedContents = fileContents.slice();
let i = optimizedContents.length - 1;

while (optimizedContents.length > 0 && i >= 0) {
  const removedLine = optimizedContents.splice(i, 1)[0];
  const tempIgnoreFile = './.stylelintignore.temp';
  fs.writeFileSync(tempIgnoreFile, optimizedContents.join('\n'), 'utf8');
  const report = stylelint.lint({
    files: ['**/*.css'],
    ignorePath: tempIgnoreFile,
    config: {
      "extends": "stylelint-config-standard",
      "ignoreDisables": true // исключаем файлы в которых есть комментарий disable
    }
  }).then((result) => {
    if (result.errored) {
      optimizedContents.splice(i, 0, removedLine); // если была найдена ошибка, добавляем строку обратно в оптимизированный файл
    }
  }).catch(error => {
    console.error(error);
  });
  i--;
}
fs.writeFileSync('./.stylelintignore', optimizedContents.join('\n'), 'utf8');
console.log('Файл .stylelintignore успешно оптимизирован!');
