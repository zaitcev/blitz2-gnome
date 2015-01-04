#!/usr/bin/gjs

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const Blitz2 = new Lang.Class({
    Name: 'Blitz2', // This could have spaces, like "Hello GNOME". Weird.

    _init: function() {
        this._app = new Gtk.Application();

        //connect to 'activate' and 'startup' signals to handlers.
        this._app.connect('activate', Lang.bind(this, this._onActivate));
        this._app.connect('startup', Lang.bind(this, this._onStartup));
    },

    _buildUI: function() {
        this._window = new Gtk.ApplicationWindow({
            application: this._app,
            // default_height: 200,  // omit the explicit size, make automatic
            default_width: 220,  // a bit wider than buttons, to see alignment.
            title: "Blitz2" });
        // this._window.set_default_size(200, 200);  // or this

        // They call it a label, but it's actually a text inside the window.
        // XXX fetch initial clipboard into the label; but limit max width
        this._label_info = new Gtk.Label({ label: "Hello World",
            margin_left: 5, margin_right: 5, margin_top: 5, margin_bottom: 5 });

        let button_up = new Gtk.Button({
            label: "Upload",
            margin_left: 5, margin_right: 5, margin_top: 5, margin_bottom: 5 });
        button_up.connect('clicked', Lang.bind(this, this._clickUp));

        let button_down = new Gtk.Button({
            label: "Download",
            margin_left: 5, margin_right: 5, margin_top: 5, margin_bottom: 5 });
        button_down.connect('clicked', Lang.bind(this, this._clickDown));

        this._grid = new Gtk.Grid({ halign: Gtk.Align.CENTER });

        let grid = new Gtk.Grid();
        // row_spacing: 20, column_spacing: 20

        // (widget, column, row, width, height)
        grid.attach(this._label_info,  0, 0, 2, 1);
        grid.attach(button_up,   0, 1, 1, 1);
        grid.attach(button_down, 1, 1, 1, 1);

        this._grid.attach(grid, 0, 0, 1, 1);

        this._window.add(this._grid);
    },

    _onActivate: function() {
        this._window.show_all();
    },

    _onStartup: function() {
        this._buildUI();
    },

    _clickUp: function() {
        this._label_info.set_label("Up");
    },

    _clickDown: function() {
        this._label_info.set_label("Down");
    }
});

let app = new Blitz2();
app._app.run(ARGV);
