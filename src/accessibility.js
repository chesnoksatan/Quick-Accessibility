import { SystemIndicator, QuickMenuToggle } from 'resource:///org/gnome/shell/ui/quickSettings.js';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from "gi://GObject"

const A11Y_ICON                     = 'org.gnome.Settings-accessibility-symbolic';

const A11Y_SCHEMA                   = 'org.gnome.desktop.a11y';
const KEY_ALWAYS_SHOW               = 'always-show-universal-access-status';

const A11Y_KEYBOARD_SCHEMA          = 'org.gnome.desktop.a11y.keyboard';
const KEY_STICKY_KEYS_ENABLED       = 'stickykeys-enable';
const KEY_BOUNCE_KEYS_ENABLED       = 'bouncekeys-enable';
const KEY_SLOW_KEYS_ENABLED         = 'slowkeys-enable';
const KEY_MOUSE_KEYS_ENABLED        = 'mousekeys-enable';
const KEY_SCREEN_MAGNIFIER_ENABLED  = 'screen-magnifier-enabled';
const KEY_SCREEN_READER_ENABLED     = 'screen-reader-enabled';
const KEY_SCREEN_KEYBOARD_ENABLED   = 'screen-keyboard-enabled';

const APPLICATIONS_SCHEMA           = 'org.gnome.desktop.a11y.applications';

const DPI_FACTOR_LARGE              = 1.25;

const WM_SCHEMA                     = 'org.gnome.desktop.wm.preferences';
const KEY_VISUAL_BELL               = 'visual-bell';

const DESKTOP_INTERFACE_SCHEMA      = 'org.gnome.desktop.interface';
const KEY_TEXT_SCALING_FACTOR       = 'text-scaling-factor';

const A11Y_INTERFACE_SCHEMA         = 'org.gnome.desktop.a11y.interface';
const KEY_HIGH_CONTRAST             = 'high-contrast';

export const Indicator = GObject.registerClass(
    class Indicator extends SystemIndicator {

        _init() {
            super._init();

            const title = _('Accessibility');

            this._settings = new Gio.Settings({schema_id: A11Y_SCHEMA});
            this._connection = this._settings.connect(`changed::${KEY_ALWAYS_SHOW}`, this._sync.bind(this));

            this._indicator = this._addIndicator();
            this._indicator.name = title;
            this._indicator.icon_name = A11Y_ICON;
            this._indicator.visible = false;

            this._toggle = new QuickMenuToggle({
                title: title,
                iconName: A11Y_ICON
            });

            this._toggle.connect("clicked", this._clicked.bind(this));

            this._toggle.menu.addMenuItem(new PopupMenu.PopupMenuSection());
            this._toggle.menu.setHeader(A11Y_ICON, title);

            this._highContrastToggle = this._buildItem(_('High Contrast'), A11Y_INTERFACE_SCHEMA, KEY_HIGH_CONTRAST);
            this._toggle.menu.addMenuItem(this._highContrastToggle);

            this._magnifierToggle = this._buildItem(_('Zoom'), APPLICATIONS_SCHEMA, KEY_SCREEN_MAGNIFIER_ENABLED);
            this._toggle.menu.addMenuItem(this._magnifierToggle);

            this._textZoomToggle = this._buildFontItem();
            this._toggle.menu.addMenuItem(this._textZoomToggle);

            this._screenReaderToggle = this._buildItem(_('Screen Reader'), APPLICATIONS_SCHEMA, KEY_SCREEN_READER_ENABLED);
            this._toggle.menu.addMenuItem(this._screenReaderToggle);

            this._screenKeyboardToggle = this._buildItem(_('Screen Keyboard'), APPLICATIONS_SCHEMA, KEY_SCREEN_KEYBOARD_ENABLED);
            this._toggle.menu.addMenuItem(this._screenKeyboardToggle);

            this._visualBellToggle = this._buildItem(_('Visual Alerts'), WM_SCHEMA, KEY_VISUAL_BELL);
            this._toggle.menu.addMenuItem(this._visualBellToggle);

            this._stickyKeysToggle = this._buildItem(_('Sticky Keys'), A11Y_KEYBOARD_SCHEMA, KEY_STICKY_KEYS_ENABLED);
            this._toggle.menu.addMenuItem(this._stickyKeysToggle);

            this._slowKeysToggle = this._buildItem(_('Slow Keys'), A11Y_KEYBOARD_SCHEMA, KEY_SLOW_KEYS_ENABLED);
            this._toggle.menu.addMenuItem(this._slowKeysToggle);

            this._bounceKeysToggle = this._buildItem(_('Bounce Keys'), A11Y_KEYBOARD_SCHEMA, KEY_BOUNCE_KEYS_ENABLED);
            this._toggle.menu.addMenuItem(this._bounceKeysToggle);

            this._mouseKeysToggle = this._buildItem(_('Mouse Keys'), A11Y_KEYBOARD_SCHEMA, KEY_MOUSE_KEYS_ENABLED);
            this._toggle.menu.addMenuItem(this._mouseKeysToggle);
            
            this._toggle.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            this._toggle.menu.addSettingsAction(_('Accessibility Settings'), 'gnome-universal-access-panel.desktop');
    
            this.quickSettingsItems.push(this._toggle);

            this._sync();
        }

        destroy() {
            this._settings.disconnect(this._connection);
            this.quickSettingsItems.forEach(item => item.destroy());
            this._indicator.destroy();
            super.destroy();
        }

        _sync() {
            this._syncIdle = 0;

            let alwaysShow = this._settings.get_boolean(KEY_ALWAYS_SHOW);
            let items = this._toggle.menu._getMenuItems();

            this._indicator.visible = alwaysShow || items.some(f => !!f.state);
            this._toggle.checked = items.some(f => !!f.state);

            return GLib.SOURCE_REMOVE;
        }

        _queueSync() {
            if (this._syncIdle)
                return;

            this._syncIdle = GLib.idle_add(GLib.PRIORITY_DEFAULT, this._sync.bind(this));
            GLib.Source.set_name_by_id(this._syncIdle, '[QuickAccessibilityExtension indicator] this._sync');
        }

        _clicked() {
            let items = this._toggle.menu._getMenuItems();

            if (items.some(f => !!f.state)) {
                items.forEach((item) => {
                    if (typeof item.setToggleState === 'function') {
                        item.setToggleState(false);
                    }
                });
                
            } else {
                this._toggle.menu.open();
            }
        }

        _buildItemExtended(string, initialValue, writable, onSet) {
            let widget = new PopupMenu.PopupSwitchMenuItem(string, initialValue);
            if (!writable) {
                widget.reactive = false;
            } else {
                widget.connect('toggled', item => {
                    onSet(item.state);
                });
            }
            return widget;
        }

        _buildItem(string, schema, key) {
            let settings = new Gio.Settings({schema_id: schema});
            let widget = this._buildItemExtended(string,
                settings.get_boolean(key),
                settings.is_writable(key),
                enabled => settings.set_boolean(key, enabled));
    
            settings.connect(`changed::${key}`, () => {
                widget.setToggleState(settings.get_boolean(key));
    
                this._queueSync();
            });
    
            return widget;
        }
    
        _buildFontItem() {
            let settings = new Gio.Settings({schema_id: DESKTOP_INTERFACE_SCHEMA});
            let factor = settings.get_double(KEY_TEXT_SCALING_FACTOR);
            let initialSetting = factor > 1.0;
            let widget = this._buildItemExtended(_('Large Text'),
                initialSetting,
                settings.is_writable(KEY_TEXT_SCALING_FACTOR),
                enabled => {
                    if (enabled) {
                        settings.set_double(
                            KEY_TEXT_SCALING_FACTOR, DPI_FACTOR_LARGE);
                    } else {
                        settings.reset(KEY_TEXT_SCALING_FACTOR);
                    }
                });
    
            settings.connect(`changed::${KEY_TEXT_SCALING_FACTOR}`, () => {
                factor = settings.get_double(KEY_TEXT_SCALING_FACTOR);
                let active = factor > 1.0;
                widget.setToggleState(active);
    
                this._queueSync();
            });
    
            return widget;
        }
    }
)
