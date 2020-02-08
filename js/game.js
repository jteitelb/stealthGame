const maxY = 600;
const maxX = 800;

const charSpeed = 160;
const p1Multiplier = 1;
const p2Multiplier = 1;
const aiMultiplier = 1;


const shurikenSpeed = 600;
const shurikenRange = 32*3.5;
const shurikenSpin = 50;

const aiCount = 10;

const maxMoveDuration = 1 * 1000; // 1.5 seconds
//const maxMoveDuration = Math.max(maxY,maxX)/charSpeed * 1000;

const diagFactor = 1.414;
const numTrials = 6;

function gaussian()
{
	var result = 0;
	for (var i = 0; i < numTrials; i++)
	{
		result += Math.random();
	}
	return result/numTrials;
}
function gaussianRange(min, max)
{
	return gaussian()*(max-min+1) + min;
}

/* random integer from 0 to max, not including max */
function randRange(max)
{
	return Math.floor(Math.random()*max);
}

function Location(x, y)
{
	this.x = x;
	this.y = y;
	return this;
}

function Move(direction, duration)
{
	this.direction = direction;
	this.duration = duration;
	return this;
}

function randLocation()
{
	var randX = randRange(maxX);
	var randY = randRange(maxY);
	return new Location(randX, randY);
}

function randMove()
{
	var direction = randRange(5);
	var duration = gaussianRange(0,maxMoveDuration);
	return new Move(direction, duration);
}

var config = {
	type: Phaser.AUTO,
	parent: "game",
	width: maxX,
	height: maxY,
	physics: {
		default: 'arcade',
		arcade: {
			debug: false
		}
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	}
};

var player;
var ninjas;
var star = {facing:0, out:false};
var wKey;
var sKey;
var aKey;
var dKey;
var spaceKey;
var enterKey;

var game = new Phaser.Game(config);

//function createPlayer(uKey, dKey,...)

function reset()
{
	player.setTexture('ninja',0);
	player2.setTexture('ninja',0);

}
function touched ()
{
	player.setTexture('redNinja',0);
	player2.setTexture('redNinja',0);
}

function starHit(star, ninja)
{
	console.log("star hit");
}

function preload ()
{
	this.load.image('background', 'assets/background.png');
	this.load.image('ninja', 'assets/ninja.png');
	this.load.image('redNinja', 'assets/redNinja.png');
	//this.load.image('shuriken', 'assets/shuriken.png');
	this.load.image('honeycomb', 'assets/honeycomb.png');
	this.load.spritesheet('shuriken', 'assets/shurikenAnim.png',{frameWidth: 32, frameHeight: 32});
/*
	this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
*/
}

function create ()
{
	this.add.image(400, 300, 'background');
	
	ninjas = this.physics.add.group({
		key: 'ninja',
		repeat: aiCount-1,
		setXY: {x: 0,y: 0}
	});
/*
	platforms = this.physics.add.staticGroup();

	platforms.create(400, 568, 'ground').setScale(2).refreshBody();

	platforms.create(600, 400, 'ground');
	platforms.create(50, 250, 'ground');
	platforms.create(750, 220, 'ground');
*/
	r1 = randLocation();
	r2 = randLocation();
	rAI = randLocation();
	player = this.physics.add.sprite(r1.x, r1.y, 'ninja');
	player2 = this.physics.add.sprite(r2.x, r2.y, 'ninja');
	ai = this.physics.add.sprite(rAI.x, rAI.y, 'ninja');
	honeycomb = this.physics.add.sprite(randLocation().x, randLocation().y, 'honeycomb');
	
	/* world bounds */
	player.setCollideWorldBounds(true);
	player2.setCollideWorldBounds(true);
	ai.setCollideWorldBounds(true);
	
	//rect = new Phaser.Geom.Rectangle(0,0,maxX,maxY);
	
	/***********************************/
	
	
	
	player.speed = charSpeed*p1Multiplier;
	player2.speed = charSpeed*p2Multiplier;
	player.facing = 1;
	player2.facing = -1;
	ai.speed = charSpeed*aiMultiplier;
	
	ai.expiryTime = 0;
	
	/* initialize ai */
	for (var i = 0; i < aiCount; i++)
	{
		ninjas.children.entries[i].setCollideWorldBounds(true);
		ninjas.children.entries[i].expiryTime = 0;  // for aiMove
		ninjas.children.entries[i].speed = charSpeed*aiMultiplier;
		var randPos = randLocation();
		ninjas.children.entries[i].setX(randPos.x);
		ninjas.children.entries[i].setY(randPos.y);
		// ninjas.children.entries[i].facing = 0;
	}
	
	cursors = this.input.keyboard.createCursorKeys();


	wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
	sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
	aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
	dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
	spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
	enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

	
	this.anims.create({
		key: 'spinLeft',
		frames: this.anims.generateFrameNumbers('shuriken', { start: 0, end: 3 }),
		frameRate: shurikenSpin,
		repeat: -1
	});
	
	this.anims.create({
		key: 'spinRight',
		frames: this.anims.generateFrameNumbers('shuriken', { frames: [3,2,1,0]}),
		frameRate: shurikenSpin,
		repeat: -1
	});
	

	/*
	this.anims.create({
		key: 'turn',
		frames: [ { key: 'ninja', frame: 4 } ],
		frameRate: 20
	});

	this.anims.create({
		key: 'right',
		frames: this.anims.generateFrameNumbers('ninja', { start: 5, end: 8 }),
		frameRate: 10,
		repeat: -1
	});
	*/
	
	this.physics.add.collider(player, player2, touched);
	this.physics.add.collider(player, ai);
	this.physics.add.collider(player2, ai);
	
	this.physics.add.overlap(star, player2, starHit, null, this);
}


/*
function Player(uButton, dButton, lButton, rButton)
{}
*/
function CreateBot()
{
}

function Bot(sprite)
{
	this.move = function(){
	}
	this.sprite = sprite;
}

function aiMove(sprite)
{
	//get time
	var now = Date.now();
	if (now >= sprite.expiryTime)
	{
		rMove = randMove();
		sprite.expiryTime = now + rMove.duration;
		switch (rMove.direction)
		{
			case 1: // right
				sprite.setVelocityX(sprite.speed);
				sprite.setVelocityY(0);
				break;	
			case 2: // up
				sprite.setVelocityX(0);
				sprite.setVelocityY(sprite.speed);
				break;	
			case 3: // left
				sprite.setVelocityX(-sprite.speed);
				sprite.setVelocityY(0);
				break;	
			case 4: // down
				sprite.setVelocityX(0);
				sprite.setVelocityY(-sprite.speed);
				break;	
			case 0:
			default:
				sprite.setVelocityX(0);
				sprite.setVelocityY(0);
				break;	
		}
	}
	//if past expiry, get next move and set vx, vy, and next expiry
}

function update ()
{
	
	aiMove(ai);
	for (var i = 0; i < aiCount; i++)
	{
		aiMove(ninjas.children.entries[i]);
	}
	/* treat direction and speed separately? */

	/* Player 1 */
	
	/* fix diagonal speed?
	if (cursors.left.isDown && cursors.up.isDown)
	{
		player.setVelocityX(-player.speed/slowFactor);
	}
	*/

	if (cursors.left.isDown)
	{
		player.setVelocityX(-player.speed);
		player.facing = -1;
	}
	if (cursors.right.isDown)
	{
		player.setVelocityX(player.speed);
		player.facing = 1;
	}
	if (cursors.up.isDown)
	{
		player.setVelocityY(-player.speed);
	}
	if (cursors.down.isDown)
	{
		player.setVelocityY(player.speed);
	}
	// kill vertical speed
	if (cursors.down.isUp && cursors.up.isUp || cursors.down.isDown && cursors.up.isDown)
	{
		player.setVelocityY(0);
	}
	// kill horizontal speed
	if (cursors.left.isUp && cursors.right.isUp || cursors.left.isDown && cursors.right.isDown)
	{
		player.setVelocityX(0);
	}
	
	
	/************** Player 2 ************/
	if (aKey.isDown)
	{
		player2.setVelocityX(-player2.speed);
		player2.facing = -1;
	}
	if (dKey.isDown)
	{
		player2.setVelocityX(player2.speed);
		player2.facing = 1;
	}
	if (wKey.isDown)
	{
		player2.setVelocityY(-player2.speed);
	}
	if (sKey.isDown)
	{
		player2.setVelocityY(player2.speed);
	}
	// kill vertical speed
	if (sKey.isUp && wKey.isUp || sKey.isDown && wKey.isDown)
	{
		player2.setVelocityY(0);
	}
	// kill horizontal speed
	if (aKey.isUp && dKey.isUp || aKey.isDown && dKey.isDown)
	{
		player2.setVelocityX(0);
	}
	if (spaceKey.isDown)
	{
		reset();
	}
	
	if (enterKey.isDown && star.out == false)
	{
		star = this.physics.add.sprite(player.x, player.y, 'shuriken');
		star.endX = player.x + player.facing*shurikenRange;
		star.facing = player.facing;
		star.out = true;
		star.setVelocityX(player.facing*shurikenSpeed);
		var animDir = star.facing == 1? 'spinRight' : 'spinLeft';
		star.anims.play(animDir, true); 
	}
	if (star.facing == -1 && star.x < star.endX || star.facing == 1 && star.x > star.endX)
	{
		star.setX(-100);
		star.setVelocityX(0);
		star.out = false;
	}
	
	
	
}
