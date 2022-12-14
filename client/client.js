var options = {
    "Casino": ["Croupier", "Sicherheitsmann", "Barkeeper", "Techniker", "Inhaber", "Spieler"],
    "Supermarkt": ["Kassierer", "Putzkraft", "Einräumer", "Lieferant", "Kunde", "Filealleiter"],
    "Militärbasis": ["Offizier", "Einfacher Soldat", "Sonderkommando", "Seelsorge", "Technische Leitung",
        "Waffenmeister"
    ],
    "Universität": ["Professor", "Student", "Bibliothekar", "Tutor", "Cafeteria-Mensch", "Nachhilfelehrer"],
    "Bank": ["Räuber", "Bankleiter", "Berater", "Kreditmanager", "Wertpapieranalyst", "Investmentbanker"],
    "Dampflokomotive": ["Heizer", "Lokführer", "Passagier", "Bremser", "Zugbegleiter", "Techniker"],
    "Filmstudio": ["Kameramann", "Regisseur", "Maskenbildner", "Stuntman", "Statist", "Audiotechniker"],
    "Flugzeug": ["Pilot", "Stewardess", "Passagier", "Co-Pilot", "Fluglotse", "Snackmensch"],
    "Hotel": ["Rezeptionist", "Koch", "Zimmermädchen", "Gast", "Hoteltester", "Valet"],
    "Kirche": ["Priester", "Jesus", "Messdiener", "Gemeindemitglied", "Mönch", "Orgelspieler"],
    "Krankenhaus": ["Chirurg", "Internist", "Patient", "Pfleger", "Assistenzarzt", "Krankenschwester"],
    "Kreuzfahrtschiff": ["Barkeeper", "Kapitän", "Zimmermädchen", "Masseur", "Techniker", "Gast"],
    "Piratenschiff": ["Kapitän", "Navigator", "Schiffszimmermann", "Schiffsarzt", "Steuermann",
        "Klabautermann"
    ],
    "Polarstation": ["Wissenschaftler", "Tierpfleger", "Funker", "Arzt", "Hundemann", "Schlittenbauer"],
    "Polizeistation": ["Hundestaffel", "Wasserschutz", "Anwalt", "GSG9", "Verbrecher",
        "Protokollschreiberling"
    ],
    "Restaurant": ["Kellner", "Koch", "Gast", "Konditor", "Restaurantkritiker", "Barkeeper"],
    "Schule": ["Schüler", "Lehrer", "Hausmeister", "Direktor", "Sekretär", "Aushilfslehrer"],
    "Strand": ["Rettungsschwimmer", "Tourist", "Bootsverleiher", "Sonnenbrillenverkäufer", "Eisverkäufer",
        "Surflehrer"
    ],
    "Theater": ["Darsteller", "Visagist", "Autor", "Bühnenbildner", "Kostümbildner", "Komponist"],
    "Wellness-Tempel": ["Friseur", "Poolboy", "Masseur", "Kosmetiker", "Gast", "Barkeeper"]
}
//**********REQUIREMENTS************
var socket = io();
var login = document.getElementById('login');
var loginField = document.getElementById('loginForm');
var game = document.getElementById('game');
var preGame = document.getElementById('preGame');
var wlcmMsg = document.getElementById('wlcm');
var lobby = document.getElementById('lobby');
var codeText = document.getElementById('code');
var startBtn = document.getElementById('startBtn');
var playerList = document.getElementById('playerList');
var gameContent = document.getElementById('gameContent');
var placeField = document.getElementById('place');
var jobField = document.getElementById('job');
var spyContent = document.getElementById('spy');
var spy = false;
var verdacht = document.querySelectorAll('.verdacht');

lobby.classList.add('hidden');
startBtn.classList.add('hidden');
startBtn.disabled = true;

var cookie = getCookie("username");

//**********CHECK IF USERNAME IS SAVED************
if (!cookie) {} else {
    login.classList.add('hidden');
    socket.emit('newPlayer', {
        username: cookie
    });
    wlcm.innerHTML = "Willkommen " + cookie;
}

gameContent.classList.add('hidden');
var keys = Object.keys(options);

//**********REGISTER AS NEW PLAYER ON SERVER************
function joinlobby() {
    socket.emit('newPlayer', {
        username: loginField.value
    });
    login.classList.add('hidden');
    setCookie("username", loginField.value, 1);
    wlcm.innerHTML = "Willkommen " + loginField.value;
}
//**********MODE SELECTION CODE**********
var switchButton = document.querySelector('.switch-button');
var switchBtnRight = document.querySelector('.switch-button-case.right');
var switchBtnLeft = document.querySelector('.switch-button-case.left');
var activeSwitch = document.querySelector('.active');
var codeInput = document.querySelector('#codeinput');
var active = 0;

function switchLeft() {
    switchBtnRight.classList.remove('active-case');
    switchBtnLeft.classList.add('active-case');
    activeSwitch.style.left = '0%';
    active = 0;
    codeInput.style.opacity = "0";
    codeInput.classList = "";
    codeInput.value = "";
}

function switchRight() {
    switchBtnRight.classList.add('active-case');
    switchBtnLeft.classList.remove('active-case');
    activeSwitch.style.left = '50%';
    active = 1;
    codeInput.style.opacity = "100";
    codeInput.classList = "notHidden"
    codeInput.focus();
    codeInput.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("joinBtn").click();
        }
    });
}

switchBtnLeft.addEventListener('click', function () {
    switchLeft();
}, false);

switchBtnRight.addEventListener('click', function () {
    switchRight();
}, false);

function joinGame() {
    if (active == 0) {
        var gameCode = Math.floor(Math.random() * (100000 - 10000) + 10000);
        socket.emit('createGame', {
            code: gameCode
        });
        startBtn.classList.remove('hidden');
    } else if (active == 1) {
        var gameCode = codeInput.value;
        if (gameCode > 9999 && gameCode < 100000) {
            socket.emit('joinGameCheck', gameCode);
        } else {
            alert("Der Code hat ein ungültiges Format");
        }
    }
}
//**********SHOW GAME VIEW************
socket.on('joinRoom', function (room) {
    preGame.classList.add('hidden');
    lobby.classList.remove('hidden');
    codeText.innerHTML = "Code: " + room;
});
//**********REFRESH PLAYER LIST************
socket.on("refreshPlayers", function (players) {
    while (playerList.firstChild) playerList.removeChild(playerList.lastChild);
    for (i = 0; i < players.length; i++) {
        var li = document.createElement('li');
        li.innerHTML = players[i];
        playerList.append(li);
    }
    if (players.length > 3) startBtn.disabled = false;
    else startBtn.disabled = true;
});
//**********DISPLAY SERVER MESSAGE IN CONSOLE************
socket.on("msg", function (msg) {
    console.log(msg);
});
//**********SHOW ERROR AS POPUP************
socket.on("errorMsg", function (msg) {
    alert(msg);
});
//**********TRY TO START GAME************
function tryStart() {
    socket.emit("tryStart");
}
//**********SHOW ACTUAL GAME VIEW (JOB AND WORKPLACE)************
var workPlace;
socket.on('startGame', (place) => {
    if (!spy) {
        preGame.classList.add('hidden');
        lobby.classList.add('hidden');
        workPlace = keys[place];
        placeField.innerHTML = workPlace;
        let jobs = Object.values(options[workPlace]);
        jobField.innerHTML = jobs[Math.floor(Math.random() * Math.floor(6))];
        socket.emit('setPlace', workPlace);
        gameContent.classList.remove('hidden');
    }
});
//**********IF SPY, HIDE NORMAL GAME VIEW, SHOW SPY VERSION, TELL SERVER YOU'RE READY************
socket.on('spy', () => {

    spy = true;
    preGame.classList.add('hidden');
    gameContent.classList.add('hidden');
    lobby.classList.add('hidden');
    spyContent.classList.remove('hidden');
    alert("Du bist der Spion. Versuche herauszufinden, wo die anderen sich befinden!");
    socket.emit('spyready');
});

//**********CREATE SPY VIEW************
/*for (i = 0; i < keys.length; i++) {
    var div = document.createElement('div');
    var input = document.createElement('input');
    var label = document.createElement('label');
    var btn = document.createElement('button');

    input.classList.add('placeElem');
    input.type = 'checkbox';
    input.name = 'choice';
    input.id = 'choice' + i;
    label.for = 'choice' + i;
    label.innerHTML = keys[i];
    btn.innerHTML = "&#10004";
    
    div.append(input);
    div.append(label);
    div.append(btn);
    spyContent.append(div);
} */


var table = document.getElementById('spyTable');
for (i = 0; i < keys.length; i++) {
    let row = table.insertRow();
    for (j = 0; j < 2; j++) {
        var td = row.insertCell();
        if (j == 0) {

            var input = document.createElement('input');
            input.classList.add('placeElem');
            input.type = 'checkbox';
            input.name = 'choice';
            input.id = 'choice' + i;

            input.addEventListener('change', (event) => {
                if (event.currentTarget.checked) {
                    toggleBtn(1, event.currentTarget.id.replace(/^\D+/g, ''));
                } else {
                    toggleBtn(0, event.currentTarget.id.replace(/^\D+/g, ''));
                }
            });

            var label = document.createElement('label');
            label.for = 'choice' + i;
            label.innerHTML = keys[i];
            td.appendChild(input);
            td.appendChild(label);
        } else if (j == 1) {
            var btn = document.createElement('button');
            btn.innerHTML = "ZUGRIFF!";
            btn.classList.add('spySubmit');
            btn.id = '' + i;
            btn.addEventListener('click', (event) => {
                SubmitSpy(event.currentTarget.id);
            });
            td.appendChild(btn);
        }
        td.style.border = '1px solid black';

    }
}

function toggleBtn(checked, id) {
    var spyBtns = document.querySelectorAll('.spySubmit');
    if (checked == 1) {
        spyBtns[id].style.opacity = "0";
    } else {
        spyBtns[id].style.opacity = "1";
    }
}
spyContent.classList.add('hidden');
//**********SEND SPY ANSWER TO SERVER************
function SubmitSpy(num) {
    socket.emit('spyChoice', num);
}

//**********NOTIFY SERVER ABOUT SUSPICION************
function verdaechtigen() {
    socket.emit('verdaechtigen');
    for (i = 0; i < verdacht.length; i++) verdacht[i].disabled = true;
}

socket.on('broadcast', function (msg) {
    alert(msg);
});
//**********SET USERNAME AS COOKIE************
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
//**********GET REQUIRED COOKIE************
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
//**********CHECK IF USERNAME COOKIE EXISTS************
function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
            setCookie("username", user, 365);
        }
    }
}

//**********TO MAIN MENU************
function toMain() {
    lobby.classList.add('hidden');
    startBtn.classList.add('hidden');
    startBtn.disabled = true;
    login.classList.add('hidden');
    gameContent.classList.add('hidden');
    preGame.classList.remove('hidden');
    spyContent.classList.add('hidden');
    codeInput.value = "";
    codeInput.classList = "";
    codeInput.style.opacity = "0";
    spy = false;
    socket.emit('toMain');
}

function checkRoom(code) {
    socket.emit('checkRoom', code)
}

socket.on('disconnect', () => {
    location.reload();
});