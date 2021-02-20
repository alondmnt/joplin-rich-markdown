import * as ImageHandlers from './images';
import * as ClickHandlers from './clickHandlers';
import { overlay } from './overlay.ts';
import { RichMarkdownSettings } from './settings';

module.exports = {
	default: function(context) { 
		return {
			plugin: function(CodeMirror) {
				async function path_from_id(id: string) {
					return await context.postMessage({name:'getResourcePath', id: id});
				}
				async function get_settings() {
					return await context.postMessage({name:'getSettings'});
				}
				CodeMirror.defineExtension('richMarkdown.updateSettings', function(newSettings: RichMarkdownSettings) {
					if (!this.state.richMarkdown) return;

					this.state.richMarkdown.settings = newSettings;
					ImageHandlers.clearAllWidgets(this);
					ImageHandlers.onSourceChanged(this, this.firstLine(), this.lastLine());
					ImageHandlers.afterSourceChanges(this);
					this.getWrapperElement().onmousemove = on_mousemove(newSettings);
				})

				function get_change_lines(change: any) {
					// change.from and change.to reflect the change location *before* the edit took place
					// when a larger scale edit happens they don't necessarily reflect the true scope of changes
					const from = change.from.line;
					let to = change.to.line;
					to -= change.removed.length;
					to += change.text.length;

					return { from, to };
				}

				function on_change(cm: any, change: any) {
					const { from, to } = get_change_lines(change);
					
					ImageHandlers.onSourceChanged(cm, from, to);
				}
				function on_update(cm: any) {
					ImageHandlers.afterSourceChanges(cm);
				}

				async function on_mousedown(cm: any, event: MouseEvent) {
					if (!cm.state.richMarkdown) return;

					const settings = cm.state.richMarkdown.settings;

					const ctrl = (event.ctrlKey || event.metaKey);
					const linksEnabled = settings.links && (ctrl || !settings.linksCtrl);
					const checkboxEnabled = settings.checkbox && (ctrl || !settings.checkboxCtrl);

					if (linksEnabled && ClickHandlers.isLink(event)) {
						const url = ClickHandlers.getLinkUrl(event);

						if (url)
							await context.postMessage({name: 'followLink', url });
					}
					else if (checkboxEnabled && ClickHandlers.isCheckbox(event)) {
						ClickHandlers.toggleCheckbox(cm, event);
					}
				}

				function on_mousemove(settings: RichMarkdownSettings) {
					return function(event: MouseEvent) {
						if (!event.target) return;

						const ctrl = (event.ctrlKey || event.metaKey);
						let cursor = '';

						if (settings.links && ClickHandlers.isLink(event)) {
							cursor = ctrl || !settings.checkboxCtrl ? 'pointer' : cursor;
						}

						if (settings.checkbox && ClickHandlers.isCheckbox(event)) {
							cursor = ctrl || !settings.linksCtrl ? 'pointer' : cursor;
						}

						const target = event.target as HTMLElement;
						target.style.cursor =  cursor;
					}
				}

				CodeMirror.defineOption('enable-rich-mode', false, async function(cm, val, old) {
					// Cleanup
					if (old && old != CodeMirror.Init) {
						cm.off('change', on_change);
						cm.off('update', on_update);
						cm.off('mousedown', on_mousedown);
						cm.removeOverlay(overlay);
						cm.state.richMarkdown = null;
						ImageHandlers.clearAllWidgets(cm);
					}
					// setup
					if (val) {
						const settings = await get_settings();
						cm.state.richMarkdown = {
							path_from_id,
							settings,
						};

						cm.on('change', on_change);
						cm.on('update', on_update);
						cm.on('mousedown', on_mousedown);

						cm.addOverlay(overlay);

						cm.getWrapperElement().onmousemove = on_mousemove(settings);
						ImageHandlers.onSourceChanged(cm, cm.firstLine(), cm.lastLine());
						ImageHandlers.afterSourceChanges(cm);
					}
				});
			},
			codeMirrorOptions: { 'enable-rich-mode': true },
		}
	},
}