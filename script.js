const canvas = document.getElementById('canvas1');
const frame = document.getElementById('frame');
const ctx = canvas.getContext('2d');
// canvas.height = window.innerHeight;
canvas.width = frame.clientWidth; // TODO check for resize events and adapt!
canvas.height = frame.clientHeight;
let radGradient1, radGradient2;
let effect;
//ctx.filter = 'url(#blur-filter)';
// // for animation-loop & controlling fps rate
// let lastTime = 0;
// let timer = 0;
// const fps = 15;
// const nextFrame = 1000 / fps; //amount of ms we wait until we trigger the next frame

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

frame.addEventListener('touchstart', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

frame.addEventListener('touchend', function() {
    mouse.x = null;
    mouse.y = null;
});

frame.addEventListener('click', function () {
    mouse.x = null;
    mouse.y = null;
})

function createCanvasGradient1() { // for BG effect
    radGradient1 = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 100, canvas.width / 2, canvas.height / 2, 400); // (x1,y1,radius1,x2,y2,radius2) // inner circle (x,y,radius 1 && outer circle (x,y,radius 22)) --> gradient will be drawn between these two circles
    radGradient1.addColorStop(0, 'rgba(51, 0, 87, 0.2)'); // (offset[0,1], color) , offset 0 == start, offset 1 == end
    radGradient1.addColorStop(0.99, 'rgba(0,0,0,0.2)'); 
}

function createCanvasGradient2() { // for character bg effect
    radGradient2 = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 100, canvas.width / 2, canvas.height / 2, 400); // (x1,y1,radius1,x2,y2,radius2) // inner circle (x,y,radius 1 && outer circle (x,y,radius 22)) --> gradient will be drawn between these two circles
    radGradient2.addColorStop(0, 'rgba(0,255,255, 0.05)'); // (offset[0,1], color) , offset 0 == start, offset 1 == end
    radGradient2.addColorStop(0.99, 'rgba(51, 0, 87, 0.5)');
    
}

/*JS ES6 classes are syntactical sugar over prototype based inheritance or JS constructor functions */

// create particle / Character
class Character {

    // characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // characters = "Fines01Front1End2Developer3With4Full5Stack6Basics/|JAVASCRIPT?ANGULAR?SQL?NoSQL?Git?RestAPI+789-*<>$";
    characters = '/><+-*$?!!=|&%#{}[]01010101Σ/><><><><><ines ❄'; // λπΣ√τ ツ
    //letters = this.characters.split(''); // array with all characters
    pushed = false;
    characterOpacity = 0.1;
    colors = [`rgb(0,255,299,${this.characterOpacity})`, `rgb(227, 27, 109,${this.characterOpacity})`, `rgb(255, 255, 255,${this.characterOpacity})`];
    pushRadius = 5; // TODO also set mouse radius (in rel to push radius?)

    // constructor method for creating and initializing an object created w a class
    constructor(x, y, acceleration) { // canvasWidth, canvasHeight, context, (fontSize from Effect, accelerationPerFrame from Effect?, radGradient2
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
        if (this.pushed) ctx.fillStyle = 'rgba(0,255,255,0.5)';//'rgb(45, 252, 216, 0.25)'; //'rgb(255,255,255,0.15)'; //'rgb(250, 39, 89)';
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
            this.pushed = true;
            setTimeout(()=>{
                this.pushed = false;
            },1100);
            // check from which side the character collides (and if it is far enough from the edge)
            if (mouse.x < this.x && this.x < canvas.width - this.fontSize * this.pushRadius) this.pushCharacter(+1,'x');
            if (mouse.x > this.x && this.x > this.fontSize * this.pushRadius) this.pushCharacter(-1,'x');
            if (mouse.y < this.y && this.y < canvas.height - this.fontSize * this.pushRadius) this.pushCharacter(+1, 'y');
            if (mouse.y > this.y && this.y > this.fontSize * this.pushRadius) this.pushCharacter(-1, 'y');
        }
    }

    pushCharacter(direction, coordinate) {
        if (coordinate == 'y') {
            this.y += direction * this.pushRadius;
            setTimeout(()=>{
                this.y -= (direction * this.pushRadius + this.speed);
            }, 1000);
        }
        if (coordinate == 'x') {
            this.x += direction * this.pushRadius;
            setTimeout(()=>{
                this.x -= direction * this.pushRadius;
            }, 1000);
        }
    }

}

// create fluid matrix rain effect
class Effect {

    animationLoop;

    constructor() { // canvas?, canvas.width, canvas.height
        this.fontSize = 12;
        this.padding = 1;
        this.numberOfColumns = canvas.width / (this.fontSize * this.padding * 2);
        this.numberOfCharactersPerColumn = canvas.height / (this.fontSize * this.padding * 2.5);
        this.accelerationPerFrame = 1; // entspr grob acceleration due to gravity m/s^2, aber vereinfachte physik, 'weight'
        this.characterArray = [];
        // for animation-loop & controlling fps rate
        this.ctx = ctx; // pass canvas
        this.lastAnimationFrame = 0;
        this.animationFrameTimer = 0;
        this.fps = 20;
        this.animationFrameInterval = 1000 / this.fps; //amount of ms we wait until we trigger the next frame
        this.#initialize();
    }

    #initialize() {
        if (this.animationLoop) cancelAnimationFrame(this.animationLoop);
        this.generateColumns();
        this.checkAnimationFrameTime(0);
    }
    // createCanvasGradient

    generateColumns() {
        this.characterArray = [];
        for (let i = 0; i < this.numberOfColumns; i++) { // check why first 2 (?) columns are screwed up
            let columnAcceleration = (Math.random() * 0.008) + 0.002; // 0.002 -  ? test
            let columnY = (Math.random() * ((canvas.height - this.fontSize * 2) - (this.fontSize * 2)) + this.fontSize * 2) * 0.33;
            for (let j = 0; j < this.numberOfCharactersPerColumn; j++) {
                this.characterArray.push(new Character(i * this.fontSize * this.padding * 2, columnY + j * this.fontSize * this.padding * 2, columnAcceleration));
            }
        }
    }

    /**
     * Creates the animation loop:
     * Compares the elapsed time in ms since the last animation frame to the object's defined animation frame interval,
     * and applies the object's animation if enough time has passed.
     * @param {number} timeStamp - timestamp in ms of the last animation frame that was served in the animation-loop 
     */
    checkAnimationFrameTime(timeStamp) {
        let deltaTime = timeStamp - this.lastAnimationFrame;
        this.lastAnimationFrame = timeStamp;

        if (this.animationFrameTimer > this.animationFrameInterval) {
            this.animate()
            this.animationFrameTimer = 0;
        } else {
            this.animationFrameTimer += deltaTime;
        }

        let self = this;
        this.animationLoop = requestAnimationFrame(() => {
            let timeStamp = Date.now();
            self.checkAnimationFrameTime(timeStamp);
        });
    }

    // animation
    animate() { // 
        this.ctx.fillStyle = radGradient1;
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        // call update method for each individual character
        for (let i = 0; i < this.characterArray.length; i++) {
            this.characterArray[i].update();
        }
    }
}

function init() { // into Effect?
    createCanvasGradient1();
    createCanvasGradient2();
    // STOP animationframetime
    if (effect) cancelAnimation();
    
    effect = new Effect(); // pass context, canvas 0r canvas-width & -height? radGradient1
}


lastAnimationFrame = 0;
animationFrameTimer = 0;
fps = 15;
animationFrameInterval = 1000 / fps;

// // create animation loop
// function animate(timeStamp) {
//     let deltaTime = timeStamp - lastAnimationFrame;
//     lastAnimationFrame = timeStamp;

//     if (animationFrameTimer > animationFrameInterval) {

//         //effect.animate();

//         // //ctx.clearRect(0, 0, innerWidth, innerHeight);
//         ctx.fillStyle = radGradient1;
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
//         // // call update method for each individual character
//         for (let i = 0; i < effect.characterArray.length; i++) {
//             effect.characterArray[i].update();
//         }
//         // // connect();

//         animationFrameTimer = 0;
//     } else { animationFrameTimer += deltaTime };

//     requestAnimationFrame(animate);
// }

function cancelAnimation() {
    if (effect && effect.animationLoop) cancelAnimationFrame(effect.animationLoop);
}

function startAnimation() {
    if (effect) effect.checkAnimationFrameTime(Date.now());
}

// start:
init();
//animate(0);