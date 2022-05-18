export default class App {
    constructor() {
        this.bindUIEvents();
        this.discordOauth();
        this.userId = null;
        this.accessToken = null;
    }
    bindUIEvents() {
        let audio = document.getElementById("audio");
        $('#play-btn').on('click', () => {
            audio.play();
            $('#play-btn').hide();
            $('#bg2').addClass('animate-bg');
            $('#login').show().delay(3500).addClass('animate-login');
        });
        $('#btn-submit').on('click', () => {
            $.post("http://localhost:5000/pass", {
                type: "POST",
                dataType: "json",
                data:{password:  $('#input-pass').val()}
            }).then((data) => {
                $.ajax({
                    type: "PUT",
                    url: `https://discordapp.com/api/v8/guilds/958742337394208808/members/${this.userId}`,
                    data: {
                        "access_token" : this.accessToken,
                    },
                    headers: {
                        "Authorization" : `Bot OTU5MTc2NTEwMTE4NDUzMzAx.YkYEvA.S9vlwGxn-Y51jk40gzm5It__AxM`,
                        'Content-Type': 'application/json'
                    }
                });
            });
            /*
            fetch('http://localhost:5000/pass', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: $('#input-pass').val() })
            });
            */
        });
    }
    discordOauth() {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

        fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${tokenType} ${accessToken}`,
            },
        })
            .then(result => result.json())
            .then(response => {
                const { username, discriminator, id } = response;
                this.userId = id;
                this.accessToken = accessToken;
                $('#login').hide();
                $('#pass-form').show();
            })
            .catch(console.error);
    }
    showForm() {

    }
}
