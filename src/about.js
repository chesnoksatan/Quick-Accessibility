import Adw from "gi://Adw"
import GObject from "gi://GObject"
import Gtk from "gi://Gtk"

import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js"

import contributors from "./data/contributors/contributors.js"

export const AboutPage = GObject.registerClass(
class AboutPage extends Adw.PreferencesPage {
    constructor(metadata) {
        super({
            name: 'about',
            title: _('About'),
            iconName: 'dialog-information-symbolic'
        })

        this.metadata = metadata;

        this.add(this._getTitleGroup());
        this.add(this._getLinksGroup());
        this.add(this._getContributorsGroup());
        this.add(this._getLicenceGroup());
    }

    _getLinksGroup() {
        const group = new Adw.PreferencesGroup({
            title: 'Links'
        });

        group.add(new LinkRow(
            'https://github.com/chesnoksatan/Quick-Accessibility', {
            title: _('Homepage'),
            subtitle: _('GitHub repository'),
        }));

        group.add(new LinkRow(
            'https://github.com/chesnoksatan/Quick-Accessibility/issues', {
            title: _('Issues'),
            subtitle: _('If you find any problem, please let us know'),
        }));

        return group;
    }

    _getContributorsGroup() {
        const group = new Adw.PreferencesGroup({
            title: 'Contributors'
        });

        for (const item of contributors) {
            group.add(new Contributor(
                item.image,
                item.link, {
                title: item.name,
                subtitle: item.label,
            }));
        }

        return group;
    }

    _getLicenceGroup() {
        const group = new Adw.PreferencesGroup({
            title: 'Licence'
        });

        group.add(new LinkRow(
            'https://choosealicense.com/licenses/gpl-3.0/', {
            title: _('GPL v3'),
        }));

        return group;
    }

    _getTitleGroup() {
        const group = new Adw.PreferencesGroup({
            title: ''
        });

        const clamp = new Adw.Clamp({maximumSize: 512});
        group.add(clamp);

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.START,
            spacing: 16
        });
        clamp.set_child(box);

        const logoImage = new Gtk.Image({
            icon_name: "accessibility",
            pixel_size: 256,
            css_classes: ['icon-dropshadow'],
        });
        box.append(logoImage);

        const titleText = new Gtk.Label({
            label: "Quick Accessibility Extension",
            css_classes: ['title-1'],
            vexpand: true,
            justify: Gtk.Justification.CENTER
        })
        box.append(titleText);

        const descriptionText = new Gtk.Label({
            label: "This is a Gnome Extension that allows you to move the a11y indicator to the quick settings menu",
            css_classes: ["dim-label"],
            vexpand: true,
            valign: Gtk.Align.FILL,
            wrap: true,
            justify: Gtk.Justification.CENTER
        })
        box.append(descriptionText);

        const versionButton = new Gtk.Button({
            label: this.metadata.version?.toString() || _("Unknown"),
            css_classes: ["pill", "small", "success"],
            halign: Gtk.Align.CENTER,
        });
        box.append(versionButton);


        return group;
    }
})

const LinkRow = GObject.registerClass(
class LinkRow extends Adw.ActionRow {
    _init(url, params) {
        this.url = url;

        super._init({
            activatable: true,
            tooltip_text: this.url, 
            ...params
        });

        this.add_suffix(new Gtk.Image({
            icon_name: "adw-external-link-symbolic",
            valign: Gtk.Align.CENTER,
        }));

        this.connect('activated', () => {
            Gtk.show_uri(null, this.url, Gdk.CURRENT_TIME);
        });
    }
})

const Contributor = GObject.registerClass(
class Contributor extends Adw.ActionRow {
    _init(avatar, url, params) {
        this.avatar = avatar;
        this.url = url;

        super._init({
            activatable: true,
            tooltip_text: this.url, 
            ...params
        });

        this.add_prefix(new Gtk.Frame({
            child: new Gtk.Image({
                icon_name: this.avatar,
                pixel_size: 32,
            }),
            valign: Gtk.Align.CENTER,
        }));

        this.add_suffix(new Gtk.Image({
            icon_name: "adw-external-link-symbolic",
            valign: Gtk.Align.CENTER,
        }));

        this.connect('activated', () => {
            Gtk.show_uri(null, this.url, Gdk.CURRENT_TIME);
        });
    }
})
