/**
* Shoutcast v0.1.6
* Author: Salomão Neto <salomaosnff3@gmail.com>
* License: MIT
* Github: https://www.github.com/salomaosnff
*/
const Shoutcast = (function(){

    /**
     * Faz uma requisição que espera um JSON Padding
     * @param url
     * @param callback
     * @param callbackParam
     */
    const jsonp = function (url, callback){
        const req = new XMLHttpRequest();

        req.open('GET', 'https://crossorigin.me/'+url);
        req.onreadystatechange = function(){
            if (req.readyState === XMLHttpRequest.DONE) {
                const data = req.status === 200 ? JSON.parse(req.responseText) : {};
                return callback(data);
            }
        };

        req.send();
    };

    /**
     * Shoutcast constructor
     * @param opts
     * @constructor
     */
    const Shoutcast = function(opts){
        this.statsData = {};

        this.playedInterval = opts.playedInterval || 30000;
        this.statsInterval = opts.statsInterval || 10000;
        this.host = opts.host;
        this.port = parseInt(opts.port, 10) || 8000;
        this.host = opts.host;
        this.port = parseInt(opts.port,10)||8000;
        this.stream = parseInt(opts.stream,10)||1;
        this.stats_path = opts.stats_path || 'stats';
        this.played_path = opts.played_path || 'played';

        // Intervals
        this._statInterval = null;
        this._playedInterval = null;

        // callbacks
        this._stats = opts.stats || function(){};
        this._played = opts.played || function(){};

        this.audio = new Audio('http://'+this.host+':'+this.port+'/;');
    };

    Shoutcast.prototype = {
        /**
         * Get stats data
         * @param callback
         * @returns {Shoutcast}
         */
        stats: function(callback){
            callback = typeof callback === 'function' ? callback : function(){};

            const $this = this, url = 'http://'+this.host+':'+this.port+'/'+this.stats_path+'?sid='+this.stream+'&json=1';

            jsonp(url, function (data) {
                if(typeof data !== 'object' || typeof data.streamstatus === 'undefined'){
                    $this._status = 0;
                    return;
                }

                //2 = No Ar, 1 = Sem Dados
                $this._status = data.streamstatus === 1 ? 2 : 1;

                $this.statsData = data;
                $this.statsData.status = $this.getStatusText();

                callback.call($this, $this.statsData);
                $this._stats($this.statsData);
            });
            return this;
        },

        /**
         * Get Played Songs
         * @param callback
         * @returns {Shoutcast}
         */
        played: function(callback){
            callback = typeof callback === 'function' ? callback : function(){};
            const
                $this = this,
                url = 'http://'+this.host+':'+this.port+'/'+this.played_path+'?sid='+this.stream+'&type=json';

            jsonp(url, function (data) {
                if(!(data instanceof Array))return;
                callback.call($this, data);
                $this._played(data);
            });

            return this;
        },

        /**
         * Get stats property
         * @param property
         * @param def
         * @returns {*|{}}
         */
        get: function(property, def){
            return property ? (
                typeof this.statsData[property.toLowerCase() !== 'undefined'] ?
                this.statsData[property.toLowerCase() !== 'undefined'] : def
            ) : this.statsData;
        },

        /**
         * Start stats Interval
         * @returns {Shoutcast}
         */
        startStats: function(){
            const $this = this;

            this.stopStats();
            this.stats();

            this._statInterval = setInterval(function () {
                $this.startStats();
            }, this.statsInterval);

            return this;
        },

        /**
         * Stop stats Interval
         * @returns {Shoutcast}
         */
        stopStats: function(){
            this._statInterval && clearInterval(this._statInterval);
            return this;
        },

        /**
         * Start Played Interval
         * @returns {Shoutcast}
         */
        startPlayed: function(){
            const $this = this;

            this.stopPlayed();
            this.played();

            this._playedInterval = setInterval(function () {
                $this.startPlayed();
            }, this.playedInterval);

            return this;
        },

        /**
         * Stop Played Interval
         * @returns {Shoutcast}
         */
        stopPlayed: function(){
            this._playedInterval && clearInterval(this._playedInterval);
            return this;
        },

        /**
         * Get Status Of Server
         */
        getStatus: function(){
            return this._status;
        },

        /**
         * Get Status Of Server As text
         * @returns {string}
         */
        getStatusText: function(){
            return ['Offline','Awaiting Connection','On Air'][this._status];
        },

        /**
         * Start Audio
         * @returns {Shoutcast}
         */
        play: function(){
            this.audio.load();
            this.audio.play();
            return this;
        },

        /**
         * Stop Audio
         * @returns {Shoutcast}
         */
        stop: function(){
            this.audio.pause();
            return this;
        },

        /**
         * Alternate between play and stop
         * @returns {Shoutcast}
         */
        togglePlay: function(){
            if(this.audio.paused) this.play();
            else this.stop();

            return this;
        },

        /**
         * Change volume from audio
         * @param value
         * @returns {Shoutcast}
         */
        volume: function(value){
            value = Math.min(value, 100);
            value = Math.max(value, 0);

            this.audio.volume = value / 100;
            return this;
        }
    };

    return Shoutcast;

})();
