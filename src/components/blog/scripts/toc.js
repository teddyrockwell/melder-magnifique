/**
 * Dive into children based on the depth.
 * @param {Object} item - The current table of contents item.
 * @param {number} depth - The depth to dive into.
 * @returns {Array} - The children array of the current depth.
 */
function diveChildren(item, depth) {
  if (depth === 1) {
    return item.children;
  } else {
    return diveChildren(item.children[item.children.length - 1], depth - 1);
  }
}

/**
 * Generate a table of contents from the headings.
 * @param {Array} headings - The list of headings.
 * @param {string} title - The title for the overview section.
 * @returns {Array} - The structured table of contents.
 */
export function buildToc(headings = []) {
  headings = [...headings.filter(({ depth }) => depth > 1 && depth < 5)];
  const toc = [];

  for (const heading of headings) {
    if (toc.length === 0) {
      toc.push({ ...heading, children: [] });
    } else {
      const lastItemInToc = toc[toc.length - 1];
      if (heading.depth < lastItemInToc.depth) {
        throw new Error(`Orphan heading found: ${heading.text}.`);
      }
      if (heading.depth === lastItemInToc.depth) {
        toc.push({ ...heading, children: [] });
      } else {
        const gap = heading.depth - lastItemInToc.depth;
        const target = diveChildren(lastItemInToc, gap);
        target.push({ ...heading, children: [] });
      }
    }
  }
  return toc;
}
