
// Taken from codemirror/addon/edit/continuelist.js
export const checkbox_regex = /^(\s*)([*+-] )(\[[Xx ]\])\s.*$/g;
// Last part of regex taken from https://stackoverflow.com/a/17773849/12245502
// This regex will match html tags tht somehow include a . in them
// I've decided that this is an acceptable level of functionality
export const link_regex = /(?<![!\\])\[[^\]]*\]\(([^\(]+)\)|<([^>]+\.[^>]+)>|(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}[^\)])/g;
export const image_regex = /!\[[^\]]*\]\([^\(]+\)/g;
const highlight_regex = /(?<!\\)==(?=[^\s])[^=]*[^=\s\\]==/g;
const insert_regex = /(?<!\\)\+\+(?=[^\s])[^\+]*[^\+\s\\]\+\+/g;
const sub_regex = /(?<![\\~])~(?=[^\s])[^~]*[^~\s\\]~/g;
const sup_regex = /(?<!\\)\^(?=[^\s])[^\^]*[^\^\s\\]\^/g;
const emph_star_regex = /(?<![\\\*])\*(?!\*)/g;
const emph_underline_regex = /(?<![\\\_])\_(?!\_)/g;
const strong_star_regex = /(?<![\\\*])\*\*(?!\*)/g;
const strong_underline_regex = /(?<![\\\_])\_\_(?!\_)/g;
const highlight_token_regex = /(?<![\\=])==(?!=)/g;
const insert_token_regex = /(?<![\\\+])\+\+(?!\+)/g;
const sub_token_regex = /(?<![\\~])~(?!~)/g;
const sup_token_regex = /(?<![\\\^])\^(?!\^)/g;
const strike_token_regex = /(?<![\\~])~~(?!~~)/g;
const header_regex = /^\s*#+\s/g;
// Taken from codemirror/addon/edit/continuelist.js
export const list_token_regex = /^(\s*)([*+-] \[[Xx ]\]\s|[*+->]\s|(\d+)([.)]\s))(\s*)/g;

const checkbox_mono_regex = /^(\s*)([*+-] )\[[Xx ]\]\s/g;
const table_regex = /^\|[^\n]+\|/g;

function exec(query: RegExp, stream: any) {
	query.lastIndex = stream.pos;
	return query.exec(stream.string);
}

function regexOverlay(name: string, regex: RegExp, requiredSettings: string[]) {
	return {
		name: "RichMarkdownOverlay-" + name,
		requiredSettings: requiredSettings,
		token: function(stream: any) {
			const match = exec(regex, stream);
	
			if (match && match.index === stream.pos) {
				// advance
				stream.pos += match[0].length || 1;
				return name;
			}
			else if (match) {
				// jump to the next match
				stream.pos = match.index;
			}
			else {
				stream.skipToEnd();
			}
	
			return null;
		},
	};
}

const overlays = [
	regexOverlay('rm-checkbox', checkbox_regex, []),
	regexOverlay('rm-link', link_regex, []),
	regexOverlay('rm-image', image_regex, []),
	regexOverlay('rm-list-token', list_token_regex, []),
	regexOverlay('search-marker', highlight_regex, ['markHighlight']),
	regexOverlay('rm-ins', insert_regex, ['insertHighlight']),
	regexOverlay('rm-sub', sub_regex, ['subHighlight']),
	regexOverlay('rm-sup', sup_regex, ['supHighlight']),
	regexOverlay('rm-header-token', header_regex, ['extraCSS']),
	regexOverlay('rm-em-token', emph_star_regex, ['extraCSS']),
	regexOverlay('rm-em-token', emph_underline_regex, ['extraCSS']),
	regexOverlay('rm-strong-token', strong_star_regex, ['extraCSS']),
	regexOverlay('rm-strong-token', strong_underline_regex, ['extraCSS']),
	regexOverlay('rm-highlight-token', highlight_token_regex, ['extraCSS', 'markHighlight']),
	regexOverlay('rm-insert-token', insert_token_regex, ['extraCSS', 'insertHighlight']),
	regexOverlay('rm-sub-token', sub_token_regex, ['extraCSS', 'subHighlight']),
	regexOverlay('rm-sup-token', sup_token_regex, ['extraCSS', 'supHighlight']),
	regexOverlay('rm-strike-token', strike_token_regex, ['extraCSS']),
	regexOverlay('rm-monospace', checkbox_mono_regex, ['enforceMono']),
	regexOverlay('rm-monospace', table_regex, ['enforceMono']),
];

function validate(settings: any, values: string[]): boolean {
	for (let value of values) {
		if (!settings[value])
			return false;
	}

	return true;
}

export function add(cm: any) {
	if (!cm.state.richMarkdown) return;

	for (let overlay of overlays)
		if (validate(cm.state.richMarkdown.settings, overlay.requiredSettings))
			cm.addOverlay(overlay);
}

export function remove(cm: any) {
	for (let overlay of overlays)
		cm.removeOverlay(overlay);
}
