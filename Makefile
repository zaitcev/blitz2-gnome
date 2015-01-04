
install:
	install -D -m 755 src/gnome-blitz2.js ${DESTDIR}/usr/bin/gnome-blitz2
	install -D -m 644 data/us.zaitcev.Blitz2.desktop.in ${DESTDIR}/usr/share/applications/us.zaitcev.Blitz2.desktop
