#!/usr/bin/gjs

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const Blitz2 = new Lang.Class({
    Name: 'Blitz2', // This could have spaces, like "Hello GNOME". Weird.

    _init: function() {
        this.application = new Gtk.Application();

        //connect to 'activate' and 'startup' signals to handlers.
        this.application.connect('activate', Lang.bind(this, this._onActivate));
        this.application.connect('startup', Lang.bind(this, this._onStartup));
    },

    _buildUI: function() {
        this._window = new Gtk.ApplicationWindow({
            application: this.application,
            // default_height: 200,  // omit the explicit size, make automatic
            default_width: 220,  // a bit wider than buttons, to see alignment.
            title: "Blitz2" });
        // this._window.set_default_size(200, 200);  // or this

        // They call it a label, but it's actually a text inside the window.
        // XXX fetch initial clipboard into the label; but limit max width
        this.label_info = new Gtk.Label({ label: "Hello World",
            margin_left: 5, margin_right: 5, margin_top: 5, margin_bottom: 5 });

        this.button_up = new Gtk.Button ({
            label: "Upload",
            margin_left: 5, margin_right: 5, margin_top: 5, margin_bottom: 5 });
        this.button_up.connect('clicked', Lang.bind(this, this._clickUp));

        this.button_down = new Gtk.Button ({
            label: "Download",
            margin_left: 5, margin_right: 5, margin_top: 5, margin_bottom: 5 });
        this.button_down.connect('clicked', Lang.bind(this, this._clickDown));

        this._grid = new Gtk.Grid({ halign: Gtk.Align.CENTER });

        this.grid = new Gtk.Grid();
        // row_spacing: 20, column_spacing: 20

        // (widget, column, row, width, height)
        this.grid.attach(this.label_info,  0, 0, 2, 1);
        this.grid.attach(this.button_up,   0, 1, 1, 1);
        this.grid.attach(this.button_down, 1, 1, 1, 1);

        this._grid.attach(this.grid, 0, 0, 1, 1);

        this._window.add(this._grid);
    },

    _onActivate: function() {
        this._window.show_all();
    },

    _onStartup: function() {
        this._buildUI();
    },

    _clickUp: function() {
        this.label_info.set_label("Up");
    },

    _clickDown: function() {
        this.label_info.set_label("Down");
    }
});

let app = new Blitz2();
app.application.run(ARGV);
