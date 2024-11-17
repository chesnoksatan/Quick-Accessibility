import Gtk from "gi://Gtk"
import Gdk from "gi://Gdk"
import Adw from "gi://Adw"

import { ExtensionPreferences, gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js"

import { AboutPage } from "./about.js"

function appendIconPath(iconTheme,path) {
    if (!iconTheme.get_search_path().includes(path))
        iconTheme.add_search_path(path)
}

export default class QuickAccessibilityExtensionPreferences extends ExtensionPreferences {
    constructor(metadata) {
        super(metadata);

        const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default())
        appendIconPath(iconTheme, this.path + "/data/images")
        appendIconPath(iconTheme, this.path + "/data/contributors/images")
    }

    fillPreferencesWindow(window) {
        let aboutPage = new AboutPage(this.metadata);
        window.add(aboutPage)
    }
}
