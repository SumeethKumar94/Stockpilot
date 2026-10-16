const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../..');
const oldPhrase = ['Inventory', 'Management'].join(' ');
const newPhrase = `${oldPhrase} System`;

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

describe('application branding', () => {
  test(`uses the updated ${newPhrase} branding`, () => {
    const component = read('frontend/src/app/app.component.ts');

    expect(component).toContain(`<small>${newPhrase}</small>`);
    expect(component).not.toContain(`<small>${oldPhrase}</small>`);
  });

  test('uses the updated browser title', () => {
    const index = read('frontend/src/index.html');

    expect(index).toContain(`<title>StockPilot · ${newPhrase}</title>`);
    expect(index).not.toContain(`StockPilot · ${oldPhrase}</title>`);
  });

  test('uses the updated README heading', () => {
    const readme = read('README.md');

    expect(readme).toContain(`# StockPilot — ${newPhrase}`);
    expect(readme).not.toContain(`# StockPilot — ${oldPhrase}\n`);
  });

  test('contains no remaining exact old phrase in repository files', () => {
    const matches = [];

    function visit(directory) {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.name === '.git' || entry.name === 'node_modules') continue;

        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          visit(entryPath);
        } else {
          const contents = fs.readFileSync(entryPath, 'utf8');
          const oldPhrasePattern = new RegExp(`${oldPhrase}(?! System)`);

          if (oldPhrasePattern.test(contents)) {
            matches.push(path.relative(repositoryRoot, entryPath));
          }
        }
      }
    }

    visit(repositoryRoot);
    expect(matches).toEqual([]);
  });
});
