#!/usr/bin/gjs

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Soup = imports.gi.Soup;

function _load_conf(filename) {
    let ret = { error: "UNKNOWN" };

    let f = Gio.file_new_for_path(filename);
    let is;
    try {
        is = f.read(null);  // this null must be a GCancellable
    } catch (e) {
        return { error: e.message };
    }
    let dis = Gio.DataInputStream.new(is);
    let line;
    // dis.read() returns Array[data,length] ... and Array[null,-1] on EOF ?!
    while ((line = dis.read_line(null)) != null && line[0] != null) {
        if (line[1] <= 0) continue;
        let textLine = line[0].toString();  // cast ByteArray so literals work

        // One would think that using RegExp were perfect here, but alas,
        // JavaScript does not return per-metacharacter matching substrings.
        // So we hand-roll everything with string searches and comparisons.
        if (textLine.substr(0, 1) == '#') continue;
        let eqX = textLine.indexOf('=');
        if (eqX == -1) continue;  // Syntax error, but whatever
        let key = textLine.slice(0, eqX);
        let value = textLine.slice(eqX+1, textLine.length);
        // Value is often quoted
        if (value.length >= 2 &&
            value.substr(0, 1) == '"' && value.substr(-1, 1) == '"') {
            value = value.slice(1,-1);
        }
        if (key == "URL") {
            ret.url = value;
        } else if (key == "CACERT") {
            ret.cacert = value;
        } else {
            ;
        }
    }
    is.close(null);
    if (!("url" in ret)) {
        return { error: "No URL" };
    }
    ret.error = null;   // This looks like an ugly way to signal errors. Sigh.
    return ret;
}

const Blitz2 = new Lang.Class({
    Name: 'Blitz2', // This could have spaces, like "Hello GNOME". Weird.

    _init: function() {
        this._app = new Gtk.Application();

        //connect to 'activate' and 'startup' signals to handlers.
        this._app.connect('activate', Lang.bind(this, this._onActivate));
        this._app.connect('startup', Lang.bind(this, this._onStartup));

        this._session = new Soup.Session();

        // If anyone knows how to call getpwnam(), patches are welcome.
        let homeDir = GLib.getenv('HOME');
        this._conf = _load_conf(homeDir + "/.config/blitz2/blitz2.conf");

        if (! this._conf.error) {
            if ("cacert" in this._conf) {
                this._session.ssl_ca_file = this._conf.cacert;
            }
            // XXX The blitz2-cli also supports SSCERT and NOCERT here.
        }
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
        this._label_info = new Gtk.Label({ label: "Ready",
            margin_left: 5, margin_right: 5, margin_top: 5, margin_bottom: 5 });

        // XXX Better than nothing, but excessively crude
        if (this._conf.error) {
            let msg = this._conf.error.substr(0, 60);
            this._label_info.set_label("Conf error: " + msg);
        }

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
        if (this._conf.error) return;

        this._label_info.set_label("(up)");

        // XXX Implement this
    },

    _clickDown: function() {
        if (this._conf.error) return;

        // Maybe find a better activity indication one day. Or drop entirely.
        this._label_info.set_label("(down)");

        let request = Soup.Message.new('GET', this._conf.url);

        // property "tls-certificate"  Read/Write (but we need CA)

        this._session.queue_message(request,
            Lang.bind(this, function(session, message) {
                if (message.status_code != Soup.KnownStatusCode.OK) {
                    if (message.status_code == Soup.Status.SSL_FAILED) {
                        // In this special case we may call
                        // soup_message_get_https_status() ... in the future
                        this._callbackDown("SSL Error", null);
                    } else {
                        this._callbackDown("Error: " + message.status_code,
                                           null);
                    }
                    return;
                }
                this._callbackDown(null, message.response_body.data);
        }));
    },

    _callbackDown: function(error, data) {
        if (error) {
            let msg = this._conf.error.substr(0, 60);
            this._label_info.set_label("Net error: " + error);
        } else {
            // This is not a debug message. It's quite useful sometimes
            // to see what we just downloaded into our clipboard.
            // XXX In addition to size limiting, purge newlines and such
            this._label_info.set_label(data.substr(0, 80));

        }
    }
});

let app = new Blitz2();
app._app.run(ARGV);
