import joplin from 'api';
import { MenuItemLocation, SettingItemType } from 'api/types';

export interface RichMarkdownSettings {
	inlineImages: boolean;
	imageHover: boolean;
	imageHoverCtrl: boolean;
	markHighlight: boolean;
	insertHighlight: boolean;
	subHighlight: boolean;
	supHighlight: boolean;
	extraCSS: boolean;
	activeLine: boolean;
	alignIndent: boolean;
	checkbox: boolean;
	links: boolean;
	clickCtrl: boolean;
	clickAlt: boolean;
	focusMode: boolean;
	theme: string;
	extraFancy: string;
	cssPath: string;
	regexOverlays: string;
}

export async function getAllSettings(): Promise<RichMarkdownSettings> {
	return {
		inlineImages: await joplin.settings.value('inlineImages'),
		imageHover: await joplin.settings.value('imageHover'),
		imageHoverCtrl: await joplin.settings.value('imageHoverCtrl'),
		markHighlight: await joplin.settings.globalValue('markdown.plugin.mark'),
		insertHighlight: await joplin.settings.globalValue('markdown.plugin.insert'),
		subHighlight: await joplin.settings.globalValue('markdown.plugin.sub'),
		supHighlight: await joplin.settings.globalValue('markdown.plugin.sup'),
		extraCSS: await joplin.settings.value('extraCSS'),
		activeLine: await joplin.settings.value('activeLine'),
		alignIndent: await joplin.settings.value('alignIndent'),
		checkbox: await joplin.settings.value('checkbox'),
		links: await joplin.settings.value('links'),
		clickCtrl: await joplin.settings.value('clickCtrl'),
		clickAlt: await joplin.settings.value('clickAlt'),
		focusMode: await joplin.settings.value('focusMode'),
		theme: await joplin.settings.value('theme'),
		extraFancy: await joplin.settings.value('extraFancy'),
		cssPath: await joplin.plugins.installationDir(),
		regexOverlays: await joplin.settings.value('regexOverlays'),
	}
}

export async function registerAllSettings() {
	await joplin.settings.registerSection('settings.calebjohn.richmarkdown', {
		label: 'Rich Markdown',
		iconName: 'fas fa-rocket'
	});

	await joplin.settings.registerSettings({
		'inlineImages': {
			value: false,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			label: 'Render images below their markdown source (only for images on their own line)'
		},

		'imageHover': {
			value: true,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			label: 'Show an image popup when hovering over the image source with Ctrl (or Opt) pressed'
		},
		'imageHoverCtrl': {
			value: false,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			label: 'Enable image popup even when Ctrl (or Opt) is not pressed'
		},

		'alignIndent': {
			value: true,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			label: 'Align wrapped list items to the indent level',
		},

		'extraCSS': {
			value: false,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			label: 'Add additional CSS classes for enhanced customization',
			description: 'See https://github.com/CalebJohn/joplin-rich-markdown#extra-css for options',
		},

		'activeLine': {
			value: false,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			label: 'Highlight the background of the current line',
		},

		'checkbox': {
			value: true,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			label: 'Toggle checkboxes with Ctrl (or Cmd)+Click'
		},

		'links': {
			value: true,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			label: 'Follow note links with Ctrl (or Cmd)+Click'
		},

		'clickCtrl': {
			value: true,
			type: SettingItemType.Bool,
			advanced: true,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			label: 'Require Ctrl (or Cmd) when clicking on elements (links and checkboxes)',
			description: 'It\'s recommended not to change this',
		},

		'clickAlt': {
			value: false,
			type: SettingItemType.Bool,
			advanced: true,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			label: 'Allow Alt (or Opt) in addition to Ctrl/Cmd  when clicking on elements (links and checkboxes)',
			description: 'It\'s recommended not to change this',
		},

		'focusMode': {
			value: false,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			label: 'Focus Mode',
			description: 'Fade everything that isn\'t the current paragraph.',
		},
		'theme': {
			label: 'Theme',
			value: 'none',
			type: SettingItemType.String,
			section: 'settings.calebjohn.richmarkdown',
			isEnum: true,
			public: true,
			options: {
				'none': 'none',
				'stylish': 'Stylish',
			},
			description: 'Warning: Changing theme can change the settings above.',
		},
		'extraFancy': {
			value: false,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			label: 'Hide Markdown Elements',
			description: 'Fades the markdown characters on other lines',
		},
		'regexOverlays': {
			value: '[]',
			type: SettingItemType.String,
			section: 'settings.calebjohn.richmarkdown',
			public: true,
			advanced: true,
			label: 'Custom classes JSON',
			description: 'Add custom classes in the format of [{"name": "className", "regex": string}] to create custom overlays referenced as "cm-className".',
		},
	});
	registerToggle('inlineImages',
		'Toggle images in the markdown editor',
		'fas fa-image');
	registerToggle('focusMode',
		'Toggle focus mode in the markdown editor',
		'fas fa-eye');
}

async function registerToggle(name: string, label: string, icon: string) {
	await joplin.commands.register({
		name: `richMarkdown.${name}`,
		label: label,
		iconName: icon,
		execute: async () => {
			const enabled = await joplin.settings.value(name);
			joplin.settings.setValue(name, !enabled);
			const settings = await getAllSettings();

			await joplin.commands.execute('editor.execCommand', {
				name: 'updateRichMarkdownSettings',
				args: [settings]
			});
		},
	});
	await joplin.views.menuItems.create(`richMarkdown${name}`, `richMarkdown.${name}`, MenuItemLocation.View);
}
