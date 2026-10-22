const fs = require('fs');
const path = require('path');

describe('repository branding', () => {
  it('replaces every exact Inventory Management occurrence with Inventory Management System', () => {
    const repositoryRoot = path.resolve(__dirname, '../..');
    const files = {
      component: fs.readFileSync(
        path.join(repositoryRoot, 'frontend/src/app/app.component.ts'),
        'utf8'
      ),
      index: fs.readFileSync(path.join(repositoryRoot, 'frontend/src/index.html'), 'utf8'),
      readme: fs.readFileSync(path.join(repositoryRoot, 'README.md'), 'utf8'),
    };

    expect(files.component).toContain('<small>Inventory Management System</small>');
    expect(files.index).toContain('<title>StockPilot · Inventory Management System</title>');
    expect(files.readme).toContain('# StockPilot — Inventory Management System');

    // The new name contains the old words as a prefix, so reject only the old
    // standalone branding forms rather than matching that intentional substring.
    expect(files.component).not.toMatch(/<small>Inventory Management<\/small>/);
    expect(files.index).not.toContain('<title>StockPilot · Inventory Management</title>');
    expect(files.readme).not.toContain('# StockPilot — Inventory Management\n');
  });
});
