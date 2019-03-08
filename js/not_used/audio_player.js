var Player = function(playlist) {
    this.playlist = playlist;
    this.index = 0;
};
Player.prototype = {
    /**
     * Play a song in the playlist.
     * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
     */
    play: function(index) {
        var self = this;
        var sound;
        var iid, type_b;
        if (index == -1)
            index = this.index;
        // index = typeof index === 'number' ? index : self.index;
        var data = self.playlist[index];
        iid = data.id;
        type_b = data.type;
        if (data.file == null) {
            alertify.error("ERR989");
            return -1;
        }
        // If we already loaded this track, use the current one.
        // Otherwise, setup and load a new Howl.
        if (data.howl) {
            sound = data.howl;
        } else {
            sound = data.howl = new Howl({
                src: [data.file],
                html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
                onplay: function() {
                    if (type_b == 1) {
                        $("#" + iid).addClass("orange");
                        $("#" + iid).removeClass("basic");
                    } else if (type_b == 2) {
                        var tmp11 = iid.split(",");
                        $('#' + tmp11[0]).transition({
                            animation: 'pulse',
                            onComplete: function() {
                                $('#' + tmp11[1]).addClass("orange big");
                            }
                        });
                    }
                },
                onload: function() {},
                onend: function() {
                    if (type_b == 1) {
                        $("#" + iid).removeClass("orange");
                        $("#" + iid).addClass("basic");
                    } else if (type_b == 2) {
                        var tmp11 = iid.split(",");
                        $('#' + tmp11[1]).removeClass("orange big");

                    }
                    self.skip('right');
                },
                onpause: function() {},
                onstop: function() {}
            });
        }
        // Begin playing the sound.
        sound.play();

        // Show the pause button.
        if (sound.state() === 'loaded') {} else {}
        self.index = index;
    },
    pause: function() {
        var self = this;
        var sound = self.playlist[self.index].howl;
        sound.pause();
    },
    stop: function() {
        var self = this;
        var sound = self.playlist[self.index];
        sound.howl.stop();
        if (self.playlist[self.index].type == 1) {
            $("#" + sound.id).removeClass("orange");
            $("#" + sound.id).addClass("basic");
        }

    },
    skip: function(direction) {
        var self = this;
        var index = 0;
        if (direction === 'prev') {
            index = self.index - 1;
            if (index < 0) {
                index = self.playlist.length - 1;
            }
        } else {
            index = self.index + 1;
            if (index >= self.playlist.length) {
                index = 0;
            }
        }

        self.skipTo(index);
    },
    skipTo: function(index) {
        var self = this;

        // Stop the current track.
        if (self.playlist[self.index].howl) {
            self.playlist[self.index].howl.stop();
        }
        self.play(index);
    }
};