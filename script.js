const canvas = document.getElementById('canvas1');
const frame = document.getElementById('frame');
const ctx = canvas.getContext('2d');
// canvas.height = window.innerHeight;
canvas.width = frame.clientWidth; // TODO check for resize events and adapt!
canvas.height = frame.clientHeight;
let radGradient1, radGradient2;
let characterArray;
//ctx.filter = 'url(#blur-filter)';
// for animation-loop & controlling fps rate
let lastTime = 0;
let timer = 0;
const fps = 15;
const nextFrame = 1000 / fps; //amount of ms we wait until we trigger the next frame

// get mouse position
let mouse = {
    x: null,
    y: null,
    radius: (canvas.height / 80) * (canvas.width / 80),
}

window.addEventListener('resize', function () {
    canvas.width = frame.clientWidth;;
    // canvas.height = innerHeight;
    canvas.height = frame.clientHeight;
    mouse.radius = (canvas.height / 90) * (canvas.width / 90); // TODO if windon.innerWidth < 845 or 800: higher rafius (canvas.height/80) ? etc. try
    // createCanvasGradient1();
    init();
});

frame.addEventListener('mousemove', function (event) { // also for touch events!
    mouse.x = event.x;
    mouse.y = event.y;
});

// mouse out event, so that particles stop interacting w mouse if they move out of the screen
frame.addEventListener('mouseout', function () { // or when mouse is still
    mouse.x = null;
    mouse.y = null;
});

function createCanvasGradient1() {
    radGradient1 = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 100, canvas.width / 2, canvas.height / 2, 400); // (x1,y1,radius1,x2,y2,radius2) // inner circle (x,y,radius 1 && outer circle (x,y,radius 22)) --> gradient will be drawn between these two circles
    radGradient1.addColorStop(0, 'rgba(51, 0, 87, 0.2)'); // (offset[0,1], color) , offset 0 == start, offset 1 == end
    radGradient1.addColorStop(0.8, 'rgba(0,0,0,0.2)'); // add as many as you want
}

function createCanvasGradient2() {
    radGradient2 = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 100, canvas.width / 2, canvas.height / 2, 400); // (x1,y1,radius1,x2,y2,radius2) // inner circle (x,y,radius 1 && outer circle (x,y,radius 22)) --> gradient will be drawn between these two circles
    radGradient2.addColorStop(0, 'rgba(0,255,255, 0.05)'); // (offset[0,1], color) , offset 0 == start, offset 1 == end
    radGradient2.addColorStop(0.8, 'rgba(255,0,255, 0.3)'); // add as many as you want
}

/*JS ES6 classes are syntactical sugar over prototype based inheritance or JS constructor functions */

// create particle / Character
class Character {

    characters =
        'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    characters = "Fines01Front1End2Developer3With4Full5Stack6Basics/|JAVASCRIPT?ANGULAR?SQL?NoSQL?Git?RestAPI+0123456789-*<>$";
    //letters = this.characters.split(''); // array with all characters
    pushed = false;
    characterOpacity = 0.1;
    colors = [`rgb(0,255,299,${this.characterOpacity})`, `rgb(227, 27, 109,${this.characterOpacity})`, `rgb(255, 255, 255,${this.characterOpacity})`];

    // constructor method for creating and initializing an object created w a class
    constructor(x, y, acceleration) { // canvasWidth, canvasHeight, context, (fontSize from Effect, accelerationPerFrame from Effect
        this.fontSize = 12; // TODO set fontsize in rel to screen size
        this.acceleration = acceleration; // * 0.01;
        this.speed = 0;
        this.x = x; //? x : (Math.random() * ((innerWidth - this. fontSize * 2) - (this.fontSize * 2)) + this.fontSize * 2);
        this.y = y;
        this.directionY = (Math.random() * 0.25) + 0.125;
        this.colorIndex = Math.floor(Math.random() * this.colors.length);
        this.characterOpacity = this.y / canvas.height;
        let index = Math.floor(Math.random() * this.characters.length);
        this.activeCharacter = this.characters.charAt(index);
       // console.log(this.acceleration)
    }

    getColorIndex() {
        let index = Math.floor(Math.random() * this.colors.length);
        return this.colors[index];
    }

    getColor() {
        this.colors = [`rgb(45, 252, 216,${this.characterOpacity})`, `rgb(250, 39, 89,${this.characterOpacity})`, `rgb(255, 255, 255,${this.characterOpacity})`];
        return this.colors[this.colorIndex];
    }

    // method to draw individual character
    draw() {
        ctx.textAlign = 'center';
        //else ctx.fillStyle = this.getColor();
        if (this.pushed) ctx.fillStyle = 'rgb(45, 252, 216, 0.25)'; //'rgb(255,255,255,0.15)'; //'rgb(250, 39, 89)';
        else ctx.fillStyle = radGradient2;
        ctx.font = this.fontSize + 'px monospace';
        ctx.fillText(this.activeCharacter, this.x, this.y);
    }

    // check character position, check mouse position, move the character, draw the character
    update() {
        // move (not colliding) character
        this.y += this.speed; // todo: probably not q. c.
        this.speed += this.acceleration;
        this.characterOpacity = (this.y * 0.7 / canvas.height) + 0.1;

        // check if character is still withhin canvas / is at bottom
        if (this.y > canvas.height) {
            this.y = -this.fontSize + 3;
            //this.characterOpacity = 0; // nicht wirkl notwendig
            this.speed = 0;
        }

        if (mouse.x && mouse.y) this.checkMouseCollision();
        // draw character
        this.draw();
    }

    // collision detection: check for collision between mouse position - character
    checkMouseCollision() { // pass: push-radius rel to canvas-size
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        //check if colliding
        if (distance < mouse.radius + this.fontSize) {
            // TODO push-radius (now just 10): rel to canvas size
            this.pushed = true;
            setTimeout(()=>{
                this.pushed = false;
            },1100);
            // check from which side the character comes (and if it is far enough from the edge)
            if (mouse.x < this.x && this.x < canvas.width - this.fontSize * 10) {
                this.x += 10; // push to the right
                setTimeout( ()=>{
                    this.x -=10 ;
                },1000);
            }
            if (mouse.x > this.x && this.x > this.fontSize * 10) {
                this.x -= 10;
                 setTimeout(() => {
                     this.x += 10;
                 }, 1000);
            }
            if (mouse.y < this.y && this.y < canvas.height - this.fontSize * 10) {
                this.y += 10;
                 setTimeout(() => {
                     this.y -= 10 - this.speed;
                 }, 1000);
            }
            if (mouse.y > this.y && this.y > this.fontSize * 10) {
                this.y -= 10;
                 setTimeout(() => {
                     this.y += (10 + this.speed);
                 }, 1000);
            }
        }

    }

}

// create fluid matrix rain effect
class Effect {
    constructor() { // canvas?, canvas.width, canvas.height
        this.fontSize = 12;
        this.padding = 1;
        this.numberOfColumns = canvas.width / (this.fontSize * this.padding * 2);
        this.numberOfCharactersPerColumn = canvas.height / (this.fontSize * this.padding * 2.5);
        this.accelerationPerFrame = 1; // entspr grob acceleration due to gravity m/s^2, aber vereinfachte physik, 'weight'
    }

    resize() { //handle init and canvas resize events

    }
}

function init() { // into Effect?
    createCanvasGradient1();
    createCanvasGradient2();
    let effect = new Effect();
    //create character array and fill it with randomized characters
    characterArray = [];

    for (let i = 0; i < effect.numberOfColumns; i++) { // check why first 2 (?) columns are screwed up
        let columnAcceleration = (Math.random() * 0.008) + 0.002; // 0.002 -  ? test
        let columnY = (Math.random() * ((canvas.height - effect.fontSize * 2) - (effect.fontSize * 2)) + effect.fontSize * 2) * 0.33;
        for (let j = 0; j < effect.numberOfCharactersPerColumn; j++) {
            characterArray.push(new Character(i * effect.fontSize * effect.padding * 2, columnY + j * effect.fontSize * effect.padding * 2, columnAcceleration));
        }
    }

}

// animation loop
function animate(timeStamp) { // 0 for first loop
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    if (timer > nextFrame) {
        //ctx.clearRect(0, 0, innerWidth, innerHeight);
        ctx.fillStyle = radGradient1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // call update method for each individual character
        for (let i = 0; i < characterArray.length; i++) {
            characterArray[i].update();
        }
        // connect();
        timer = 0;
    } else {
        timer += deltaTime;
    }

    requestAnimationFrame(animate);
}

// start:
init();
animate(Date.now());