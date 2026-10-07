/** Starting content of the Text Editor page's modes. Not part of the library */

export const SAMPLE_TITLE = 'Customer Portal Redesign';

/** Shows every feature of the editor; it's what the Text Editor page and the Welcome preview open with */
export const SAMPLE_DOCUMENT = `<p style="text-align: center;"><span style="color: #64748b; font-size: 13px;">PROJECT PROPOSAL · DRAFT</span></p>
<h1 style="text-align: center;">Customer Portal Redesign</h1>
<p style="text-align: center;"><em>Prepared by the Product team · Version 1.2</em></p>
<h2>1. Summary</h2>
<p>This proposal describes a redesign of the <strong>customer portal</strong>: a faster dashboard, a simpler billing area
and self-service account settings. The goal is to cut support tickets about billing by
<span style="background-color: #fef08a;"><strong>30%</strong></span> within two quarters of launch.</p>
<h2>2. Goals</h2>
<ol>
<li>Show the account's status, invoices and usage on one screen.
<ol><li>Usage for the current and the last billing period</li><li>Alerts before a limit is reached</li></ol></li>
<li>Let customers update payment details without contacting support.</li>
<li>Meet <a href="https://www.w3.org/TR/WCAG22/">WCAG 2.2</a> AA across the portal.</li>
</ol>
<h2>3. Scope</h2>
<p>In scope for the first release:</p>
<ul>
<li>Dashboard with <span style="background-color: #bfdbfe;">usage charts</span> and alerts</li>
<li>Invoices: list, filters, PDF download</li>
<li>Account settings: profile, team members, security</li>
</ul>
<blockquote>Out of scope: the public marketing site and the mobile apps, which follow in a later phase.</blockquote>
<h3>Launch checklist</h3>
<ul>
<li data-list="checked">Kick-off with stakeholders</li>
<li data-list="checked">User interviews (12 customers)</li>
<li data-list="unchecked">Design review</li>
<li data-list="unchecked">Beta sign-up page</li>
</ul>
<h2>4. Timeline</h2>
<table>
<tr><td><strong>Phase</strong></td><td><strong>Duration</strong></td><td><strong>Owner</strong></td></tr>
<tr><td>Discovery</td><td>3 weeks</td><td>Research</td></tr>
<tr><td>Design</td><td>4 weeks</td><td>Product design</td></tr>
<tr><td>Build</td><td>8 weeks</td><td>Engineering</td></tr>
<tr><td>Beta</td><td>2 weeks</td><td>Customer success</td></tr>
</table>
<p>The beta runs with <span style="color: #16a34a;"><strong>selected customers</strong></span>; see the
<a href="https://example.com/roadmap">roadmap</a> for dates.</p>
<h2>5. Technical notes</h2>
<p>The portal reads account data from the existing API with <code>GET /summary</code>:</p>
<pre>GET /api/v2/accounts/{id}/summary
Authorization: Bearer &lt;token&gt;</pre>
<p class="ql-indent-1">Responses are cached for <span style="color: #e11d48;">60 seconds</span>.</p>
<h2>6. Writing tools</h2>
<p>Text comes in <span style="font-size: 12px;">small</span>, normal, <span style="font-size: 18px;">large</span> and
<span style="font-size: 24px;">huge</span> sizes, with <strong>bold</strong>, <em>italic</em>, <u>underline</u>,
<s>strike</s>, superscript (x<sup>2</sup>), subscript (H<sub>2</sub>O) and <code>inline code</code>.</p>
<ul>
<li><strong>Markdown as you type:</strong> <code># </code> for a heading, <code>- </code> or <code>1. </code> for a list,
<code>[] </code> for a checklist, <code>&gt; </code> for a quote, <code>**bold**</code>, <code>*italic*</code> and
<code>---</code> then Enter for a divider.</li>
<li><strong>Typography:</strong> type <code>-&gt;</code> for an arrow →, <code>--</code> for a dash — and
<code>(c)</code> for ©.</li>
<li><strong>Find &amp; replace:</strong> press Ctrl/⌘ F, or the search button in the toolbar.</li>
<li><strong>Tables:</strong> pick a size with the table button; inside a table, it adds and removes rows and
columns.</li>
</ul>
<p style="text-align: right;"><em>Images by upload, address, paste or drag and drop:</em></p>
<p><img src="nexprime-hero.svg" alt="NexPrime"></p>
<hr>
<h2>7. Approval</h2>
<p>Please review and comment by <strong>Friday</strong>. Replace this text with your own: everything on this page is
editable, and your changes are saved in this browser.</p>`;

export const SAMPLE_SIMPLE = `<h2>Hello, NexPrime 👋</h2>
<p>Type here and watch the <strong>HTML</strong> update on the right. Try <em>italic</em>, <u>underline</u>, a
<a href="https://example.com">link</a> (Ctrl/⌘ K) or a list:</p>
<ul><li>Select some text</li><li>Pick a format in the toolbar</li></ul>`;

export interface SampleComment {
  name: string;
  time: string;
  html: string;
}

export const SAMPLE_COMMENTS: SampleComment[] = [
  {
    name: 'Ava Thompson',
    time: '2 hours ago',
    html: '<p>The new dashboard looks great. Can we add <strong>CSV export</strong> to the invoices list?</p>',
  },
  {
    name: 'Liam Carter',
    time: '1 hour ago',
    html: '<p>Agreed. Two notes:</p><ul><li>Keep the filters sticky</li><li>Show totals per month</li></ul>',
  },
];
