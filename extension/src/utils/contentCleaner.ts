export const cleanHtml = (html: string): string => {
    if (!html) return "";

    const div = document.createElement("div");
    div.innerHTML = html;

    // Remove elements that often cause double titles or messy text
    const trashSpecs = [
        'header', 'footer', '.infobox', '.metadata',
        '.mw-editsection', '.reference', '.thumbcaption',
        'figure', 'figcaption', '.reflist', '.navbox'
    ];

    trashSpecs.forEach(selector => {
        div.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Remove empty tags
    div.querySelectorAll('p, div, span').forEach(el => {
        if (!el.textContent?.trim()) el.remove();
    });

    return div.innerHTML;
};

export const getCleanParagraphs = (html: string): string[] => {
    const div = document.createElement("div");
    div.innerHTML = cleanHtml(html);

    // Remove any children of elements we want to select to avoid double-counting
    // (e.g. don't pick a <div> AND its <p> child)
    const targets = Array.from(div.querySelectorAll('p, li, blockquote, h1, h2, h3'));

    // If no semantic tags found, fallback to divs
    if (targets.length < 3) {
        div.querySelectorAll('div').forEach(el => targets.push(el));
    }

    const paragraphs: string[] = [];
    const seenText = new Set<string>();

    targets.forEach(el => {
        const text = el.textContent?.trim() || "";
        // Only take "meaty" paragraphs and avoid duplicates
        if (text.length > 20 && !seenText.has(text)) {
            // Check if this element's text is already contained in a previously added paragraph
            // to avoid taking a container div after taking its p children
            const isSubset = paragraphs.some(p => p.includes(text));
            const containsOther = paragraphs.some(p => text.includes(p));

            if (!isSubset && !containsOther) {
                paragraphs.push(text);
                seenText.add(text);
            }
        }
    });

    return paragraphs;
};
