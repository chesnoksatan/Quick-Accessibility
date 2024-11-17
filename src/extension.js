import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {Indicator} from './accessibility.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class QuickAccessibilityExtension extends Extension {
    enable() {
        console.debug("[QuickAccessibilityExtension]", "Extension enabled");
        console.debug("[QuickAccessibilityExtension]", "Start loading");

        this._indicator = new Indicator();
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);

        this._systemA11yIndicator = Main.panel.statusArea['a11y'];
        this._systemA11yIndicator.hide();
        this._connection = this._systemA11yIndicator.connect("show", () => this._systemA11yIndicator.hide());

        console.debug("[QuickAccessibilityExtension]", "Loaded");
    }

    disable() {
        console.debug("[QuickAccessibilityExtension]", "Extension disabled");

        if (this._systemA11yIndicator) {
            this._systemA11yIndicator.disconnect(this._connection);
            this._connection = null;
            this._systemA11yIndicator._syncMenuVisibility();
        }

        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }

        console.debug("[QuickAccessibilityExtension]", "Complete disabling");
    }
}
