window.onload = function() {
    var player   = document.getElementById("player");
    var toggle   = player.querySelector(".toggle");
    var mute   = player.querySelector(".volume .material-icons");
    var icon = toggle.querySelector("i");
    var status   = player.querySelector(".status .value");
    var led      = player.querySelector(".status .led");
    var ouvintes = player.querySelector(".ouvintes .value");
    var bitrate  = player.querySelector(".bitrate .value");
    var current  = player.querySelector(".current");
    var slider = player.querySelector(".input");
    var played = player.querySelector(".bottom ul");
    var last_volume = 50;

    function atualizarStatus(data){
        var status_color,
            status_text = 'off';
        switch (radio.getStatus()) {
            case 1:
                status_color = 'green';
                status_text = "Aguardando conexão...";
                break;
            case 2:
                status_color = 'red';
                status_text = "No Ar";
                break;
            default:
                status_color = 'off';
                status_text = "Offline";
                break;
        }

        ouvintes.innerHTML = data.currentlisteners || 0;
        bitrate.innerHTML = data.bitrate ? data.bitrate + " Kb/s" : "Sem dados";
        status.innerHTML = status_text;
        led.className = "led "+status_color;
        current.innerHTML = data.songtitle || data.servertitle ||data.serverurl || "Sem Dados";

        console.log(data);
    }

    function atualizarTocadas(musicas){
        played.innerHTML = "";
        for(var m in musicas){
            var musica = document.createElement("li");
            musica.innerText = musicas[m].title;
            played.appendChild(musica)
        }
    }


    var radio = new Shoutcast({
        host: 'ssl.srvstm.com',
        port: '18860',
	//host:'69.30.217.222',
	//port: '8948',
        stats: atualizarStatus,
        played: atualizarTocadas
    });

    radio.startStats();
    radio.startPlayed();

    noUiSlider.create(slider, {
        start: 50,
        connect: 'lower',
        range: {
            'min': 0,
            'max': 100
        }
    });

    toggle.addEventListener('click', function(){
        toggle.disabled = true;
        radio.togglePlay();
        console.log(icon);

    });

    radio.audio.addEventListener('playing', function () {
        icon.innerText = "stop";
        toggle.disabled = false;
    });

    radio.audio.addEventListener('pause', function () {
        icon.innerText = "play_arrow";
        toggle.disabled = false;
    });
    mute.addEventListener('click', function(){
        if (radio.audio.volume <= 0) {
            slider.noUiSlider.set(last_volume);
        } else {
            last_volume = slider.noUiSlider.get();
            slider.noUiSlider.set(0)
        }
    });

    slider.noUiSlider.on('update', function (handler, el) {
        var vol = handler[el] || 75;
        radio.volume(vol);

        if(vol <= 0){
            mute.innerText = "volume_mute";
        } else {
            mute.innerText = "volume_up";
        }
    });

    radio.play();
};
