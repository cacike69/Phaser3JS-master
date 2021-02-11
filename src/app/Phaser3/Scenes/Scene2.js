import { ThrowStmt } from "@angular/compiler";
import { chdir } from "process";
import { isThisTypeNode } from "typescript";
import Bootloader from "../Bootloader";

class Scene2 extends Phaser.Scene {
    constructor() {
        super("Scene2");
    }

    preload() {
        this.load.tilemapTiledJSON("map", "assets/scene2/json/map3.json");
        this.load.spritesheet("tiles", "assets/scene2/img/tiles.png", {
            frameWidth: 70,
            frameHeight: 70,
        });
        this.load.image("coin", "assets/scene2/img/coinGold.png");
        /*this.load.atlas(
      "player",
      "assets/scene2/img/player.png",
      "assets/scene2/json/player.json"
    );
*/
        this.load.atlas(
            "player",
            "assets/scene2/img/obrero.png",
            "assets/scene2/json/obrero.json"
        );


        this.load.image("bomb", "assets/scene2/img/bomb.png");
        this.load.image('armor05', "assets/scene2/armor/armor0,5.png");
        this.load.image('armor1', "assets/scene2/armor/armor1.png");
        this.load.image('armor15', "assets/scene2/armor/armor1,5.png");
        this.load.image('armor2', "assets/scene2/armor/armor2.png");
        this.load.image('armor25', "assets/scene2/armor/armor2,5.png");
        this.load.image('armor3', "assets/scene2/armor/armor3.png");

        this.load.audio("music", "assets/scene2/sounds/gamemusic.mp3");
        this.load.audio("coin", "assets/scene2/sounds/coin.mp3");
        this.load.audio("pain", "assets/scene2/sounds/pain.mp3");

        //this.load.image("info1", "assets/scene2/img/info1.jpg");
    }

    create() {
        this.armorPoints = 0;
        this.life = 100;
        this.pain = 1;
        this.gameOver = false;
        this.timer = 0;
        this.countBombs = 0;
        this.countDistanceDamage = 0;
        this.resume = false;

        //Add sounds
        //this.music = this.sound.add("music", {loop: true});
        this.coin = this.sound.add("coin", { loop: false });
        this.painSound = this.sound.add("pain", { loop: false });

        //Play music
        //this.music.play();

        // Color de fondo
        this.cameras.main.setBackgroundColor("#ccccff");

        this.map = this.make.tilemap({ key: "map" });
        this.groundTiles = this.map.addTilesetImage("tiles");
        this.groundLayer = this.map.createDynamicLayer(
            "World",
            this.groundTiles,
            0,
            0
        );
        this.groundLayer.setCollisionByExclusion([-1]);

        this.physics.world.bounds.width = this.groundLayer.width;
        this.physics.world.bounds.height = this.groundLayer.height;

        // coin image used as tileset
        this.coinTiles = this.map.addTilesetImage("coin");
        // add coins as tiles
        this.coinLayer = this.map.createDynamicLayer("Coins", this.coinTiles, 0, 0);

        // create the player sprite
        this.player = this.physics.add.sprite(260, 400, "player");
        //this.player.setBounce(0.2); // our player will bounce from items
        this.player.setCollideWorldBounds(true); // don't go out of the map
        this.player.setScale(0.25, 0.25);

        // small fix to our player images, we resize the physics body object slightly
        this.player.body.setSize(this.player.width, this.player.height - 8);

        // player will collide with the level tiles
        this.physics.add.collider(this.groundLayer, this.player);

        //this.physics.add.overlap(this.player, this.coinTiles, this.collectCoin, null, this);
        this.coinLayer.setTileIndexCallback(17, this.collectCoin, this);

        //this.groundLayer.setTileIndexCallback(14, this.collectCoin, this);
        //this.coinLayer.setTileIndexCallback(17, this.damageCoin, this);

        // when the player overlaps with a tile with index 17, collectCoin
        // will be called
        this.physics.add.overlap(this.player, this.coinLayer);

        // player walk animation
        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNames("player", {
                prefix: "p1_walk",
                start: 1,
                end: 8,
                zeroPad: 2,
            }),
            frameRate: 10,
            repeat: -1,
        });
        // idle with only one frame, so repeat is not neaded
        this.anims.create({
            key: "idle",
            frames: [{ key: "player", frame: "p1_stand" }],
            frameRate: 10,
        });

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels
        );
        // make the camera follow the player
        this.cameras.main.startFollow(this.player);

        // this text will show the armorPoints
        /*this.text = this.add.text(20, 20, "0", {
          fontSize: "40px",
          fill: "#000000",
        });*/


        //Pain points
        this.painText = this.add.text(20, 20, "Dolor: 0", {
            fontSize: "40px",
            fill: "#000000",
            fontFamily: 'Font1',
        });

        //Live points
        this.lifeText = this.add.text(300, 20, "Vida: 100", {
            fontSize: "40px",
            fill: "#000000",
            fontFamily: 'Font1',
        });


        // fix the text to the camera
        //this.text.setScrollFactor(0);
        this.painText.setScrollFactor(0);
        this.lifeText.setScrollFactor(0);

        //Fix the armors in right-top screen inivisible
        this.armor05 = this.add.image(700, 30, "armor05");
        this.armor05.setScale(0.1).setDisplaySize(150, 50).setVisible(false);
        this.armor05.setScrollFactor(0);
        this.armor1 = this.add.image(700, 30, "armor1");
        this.armor1.setScale(0.1).setDisplaySize(150, 50).setVisible(false);
        this.armor1.setScrollFactor(0);
        this.armor15 = this.add.image(700, 30, "armor15");
        this.armor15.setScale(0.1).setDisplaySize(150, 50).setVisible(false);
        this.armor15.setScrollFactor(0);
        this.armor2 = this.add.image(700, 30, "armor2");
        this.armor2.setScale(0.1).setDisplaySize(150, 50).setVisible(false);
        this.armor2.setScrollFactor(0);
        this.armor25 = this.add.image(700, 30, "armor25");
        this.armor25.setScale(0.1).setDisplaySize(150, 50).setVisible(false);
        this.armor25.setScrollFactor(0);
        this.armor3 = this.add.image(700, 30, "armor3");
        this.armor3.setScale(0.1).setDisplaySize(150, 50).setVisible(false);
        this.armor3.setScrollFactor(0);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.bombs = this.physics.add.group();
        this.physics.add.collider(
            this.player,
            this.bombs,
            this.damageBomb,
            null,
            this
        );

        this.graphic = this.add.graphics({ lineStyle: { color: 0x00ffff } });

    }

    collectCoin(sprite, tile) {
        this.coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
        this.armorPoints += 10; // add 10 points to the armorPoints
        this.coin.play();
        //this.text.setText(this.armorPoints); // set the text to show the current armorPoints
        if (this.armorPoints === 10) {
            this.armor05.setVisible(true);
        } else if (this.armorPoints === 20) {
            this.armor1.setVisible(true);
        } else if (this.armorPoints === 30) {
            this.armor15.setVisible(true);
        } else if (this.armorPoints === 40) {
            this.armor2.setVisible(true);
        } else if (this.armorPoints === 50) {
            this.armor25.setVisible(true);
        } else if (this.armorPoints === 60) {
            this.armor3.setVisible(true);
        }
        return false;
    }

    damageBomb(sprite, tile) {
        this.countBombs++;
        //this.coinLayer.removeTileAt(tile.x, tile.y);
        if (this.armorPoints != 0) {
            this.armorPoints -= 10;
            const rndom = Math.floor(Math.random() * (10));
            this.pain += rndom;
        } else {
            this.life -= 10;
            const rndom = Math.floor(Math.random() * (20 - 5) + 5);
            this.pain += rndom;
        }

        console.log(this.pain + " pain");

        this.painSound.play();
        this.lifeText.setText("Vida: " + this.life);
        this.painText.setText("Dolor: " + this.pain);
        this.player.anims.play("idle", true);
        this.bombs.children.iterate(function(child) {
            this.bombs.remove(child, true);
        }, this);

        //Show message
        if (this.countBombs == 1) {
            this.scene.pause();
            this.scene.launch('SceneMsg1');
            /*this.player.setTint(0xff0000);
            const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
            const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
            this.info = this.add.image(screenCenterX, screenCenterY, "info1");
            this.info.setOrigin(0.5,0.5);
            this.info.setScale(0.5);
            this.info.setInteractive();
            this.info.on('pointerdown', function(){
              this.setVisible(false);
            });*/

        }
        return false;
    }


    update(time, delta) {
        this.timer += delta;

        while (this.timer > 2000) {
            this.timer -= 2000;
            /*this.x =
              this.player.x < 400
                ? Phaser.Math.Between(400, 800)
                : Phaser.Math.Between(0, 400);*/

            this.x = Phaser.Math.Between(this.player.x - 300, this.player.x + 300);
            this.bomb = this.bombs.create(this.x, 100, "bomb");
            //this.bomb.setBounce(1);
            this.physics.add.collider(this.groundLayer, this.bomb);
            //this.bomb.setCollideWorldBounds(true);
            this.bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            this.bomb.allowGravity = false;


            // Dolor a distancia
            this.damageDist = Phaser.Math.Distance.BetweenPoints(this.player, this.bomb);
            console.log(this.damageDist);

            /*this.graphic
            .clear()
            .strokeCircle(this.player.x, this.player.y, this.damageDist);*/

            if (this.damageDist <= 200) {
                this.countDistanceDamage++;
                this.time.addEvent({
                    delay: 2000,
                    callback: () => {
                        this.damageBomb();
                        if (this.countDistanceDamage == 1) {
                            this.scene.pause();
                            this.scene.launch('SceneMsg2');
                        }
                    },
                    loop: false
                })

            }

        }


        if (this.life <= 0) {
            this.gameOver = true;
            this.physics.pause();
            this.player.setTint(0xff0000);
            this.player.anims.play('idle', true);
            this.scoreText = this.add.text(130, 250, "Game Over", {
                fontSize: "100px",
                fill: "#000000",
                fontFamily: 'Font1',
            });
            this.scoreText.setScrollFactor(0);
            this.time.addEvent({
                delay: 2000,
                callback: () => {
                    this.scene.start('Scene2');
                },
                loop: false
            })
        }

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-200);
            this.player.anims.play("walk", true); // walk left
            this.player.flipX = true; // flip the sprite to the left
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(200);
            this.player.anims.play("walk", true);
            this.player.flipX = false; // use the original sprite looking to the right
        } else {
            this.player.body.setVelocityX(0);
            this.player.anims.play("idle", true);
        }
        // jump
        if (this.cursors.up.isDown && this.player.body.onFloor()) {
            this.player.body.setVelocityY(-550); //500
        }


    }
}

export default Scene2;
