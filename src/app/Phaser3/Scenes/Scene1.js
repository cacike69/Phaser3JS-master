
class Scene1 extends Phaser.Scene {

  constructor() {
    super("Scene1");
  }

  preload(){
    this.load.tilemapTiledJSON('map', 'assets/img-scene1/map.json');
    this.load.spritesheet('tiles', 'assets/img-scene1/tiles.png', {frameWidth: 70, frameHeight: 70});
    this.load.image('coin', 'assets/img-scene1/coinGold.png');
    this.load.atlas('player', 'assets/img-scene1/player.png', 'assets/img-scene1/player.json');
  }

  create() {

    var map;
    var player;
    var cursors;
    var groundLayer, coinLayer;
    var text;

    map = this.make.tilemap({key: 'map'});
    var groundTiles = map.addTilesetImage('tiles');
    groundLayer = map.createDynamicLayer('World', groundTiles, 0, 0);
    groundLayer.setCollisionByExclusion([-1]);

    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    // coin image used as tileset
    var coinTiles = map.addTilesetImage('coin');
    // add coins as tiles
    coinLayer = map.createDynamicLayer('Coins', coinTiles, 0, 0);

    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    // create the player sprite
    this.player = this.physics.add.sprite(200, 200, 'player');
    this.player.setBounce(0.2); // our player will bounce from items
    this.player.setCollideWorldBounds(true); // don't go out of the map

    // small fix to our player images, we resize the physics body object slightly
    this.player.body.setSize(this.player.width, this.player.height-8);

    // player will collide with the level tiles
    this.physics.add.collider(groundLayer, player);

    coinLayer.setTileIndexCallback(17, collectCoin, this);
    // when the player overlaps with a tile with index 17, collectCoin
    // will be called
    this.physics.add.overlap(this.player, coinLayer);

    // player walk animation
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2}),
        frameRate: 10,
        repeat: -1
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'idle',
        frames: [{key: 'player', frame: 'p1_stand'}],
        frameRate: 10,
    });


    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(this.player);

    // set background color, so the sky is not black
    this.cameras.main.setBackgroundColor('#ccccff');

    // this text will show the score
    text = this.add.text(20, 570, '0', {
        fontSize: '20px',
        fill: '#ffffff'
    });
    // fix the text to the camera
    text.setScrollFactor(0);

    this.cursors = this.input.keyboard.createCursorKeys();
    console.log(cursors);
  }

  collectCoin(sprite, tile) {
    coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
    score++; // add 10 points to the score
    text.setText(score); // set the text to show the current score
    return false;
  }

  update(time, delta) {

      if (this.cursors.left.isDown)
      {
          this.player.body.setVelocityX(-200);
          this.player.anims.play('walk', true); // walk left
          this.player.flipX = true; // flip the sprite to the left
      }
      else if (this.cursors.right.isDown)
      {
          this.player.body.setVelocityX(200);
          this.player.anims.play('walk', true);
          this.player.flipX = false; // use the original sprite looking to the right
      } else {
          this.player.body.setVelocityX(0);
          this.player.anims.play('idle', true);
      }
      // jump
      if (this.cursors.up.isDown && this.player.body.onFloor())
      {
          this.player.body.setVelocityY(-500);
      }
  }


}

export default Scene1;
