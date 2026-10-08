import { markdownToHtml } from './text-editor-page-utils';

describe('markdownToHtml', () => {
  it('converts headings, paragraphs, inline formats, links and dividers', () => {
    expect(
      markdownToHtml('# Title\n\nSome **bold**, *italic*, `a*b*c` and ~~old~~\ntext.\n\n---'),
    ).toBe(
      '<h1>Title</h1>\n<p>Some <strong>bold</strong>, <em>italic</em>, <code>a*b*c</code> and <s>old</s> text.</p>\n<hr>',
    );
    expect(markdownToHtml('[site](https://example.com) and my_var_name')).toBe(
      '<p><a href="https://example.com">site</a> and my_var_name</p>',
    );
  });

  it('converts lists with tasks, quotes, code blocks and tables', () => {
    expect(markdownToHtml('- one\n- [x] done\n- [ ] todo\n\n1. first\n2. second')).toBe(
      '<ul><li>one</li><li data-list="checked">done</li><li data-list="unchecked">todo</li></ul>\n' +
        '<ol><li>first</li><li>second</li></ol>',
    );
    expect(markdownToHtml('> a\n> b\n\n```\n<b>x</b>\n```')).toBe(
      '<blockquote>a b</blockquote>\n<pre>&lt;b&gt;x&lt;/b&gt;</pre>',
    );
    expect(markdownToHtml('| A | B |\n| --- | --- |\n| 1 | 2 |')).toBe(
      '<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>',
    );
  });

  it('escapes HTML and blocks unsafe link addresses', () => {
    expect(markdownToHtml('<img src=x onerror=alert(1)>')).toBe(
      '<p>&lt;img src=x onerror=alert(1)&gt;</p>',
    );
    expect(markdownToHtml('[x](javascript:alert(1))')).toContain('href="#"');
    expect(markdownToHtml('[x](https://a.com/?q="><script>)')).not.toContain('"><script>');
  });
});
