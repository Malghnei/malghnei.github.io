// Every element matching this is one numbered "line" in the buffer.
// Keep in sync with the line-numbering rules in src/routes/layout.css.
export const LINE_SELECTOR =
	':is(h1, h2, h3, h4, h5, h6, p, li, hr, pre, blockquote, .line):not(li *, .line *, blockquote *, .banner-h1)';
