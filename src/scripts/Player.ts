import {
    apate,
    audio,
    Button,
    Color,
    DrawLib,
    Entity,
    globalStorage,
    levelLoader,
    ParticleSystem,
    restart,
    spriteLoader,
    transition,
} from "../game.js";
import { LevelData } from "../LevelLoader.js";
import Tilemap, { Tile } from "./Tilemap.js";

export default class Player extends Entity {
    public x: number = 0;
    public y: number = 0;
    public velX: number = 0;
    public velY: number = 0;

    public forceX: number = 0;
    public forceY: number = 0;

    public speed: number = 4;
    private wallSlidingSpeed: number = 0.6;
    private gravity: number = 1;

    private jumpForce: number = 7.25;

    private isWalking: boolean = false;

    private currentAnim: string = "walk";
    private currentFrame: number = 0;
    private nextFrame: number = 20 / 1000;

    private isGounded: boolean = false;
    private touchingLeftWall: boolean = false;
    private touchingRightWall: boolean = false;

    private isWallJumping: boolean = false;

    private isDead: boolean = false;
    private partilces: ParticleSystem = new ParticleSystem(true, 0, true);

    private friction: number = 0.4;

    private spriteOffsetX: number = 3;

    private lvlData: LevelData;
    private tilemap: Tilemap;

    public facingRight: boolean = true;

    public canTeleport: boolean = false;
    private canThrow: boolean = false;
    public isTeleporting: boolean = false;
    private teleportSpeed: number = 8;
    private teleportY: number = 0;
    private teleportX: number = 0;
    private teleportingRight: boolean = true;

    public handleInput: boolean = true;

    private checkpoints: { x: number; y: number }[] = [];

    constructor(x: number, y: number, lvlData: LevelData) {
        super();

        this.x = x;
        this.y = y;

        this.lvlData = lvlData;
        this.tilemap = lvlData.tilemap;

        if (globalStorage.hasUnlockedTeleporter) this.canTeleport = true;

        this.checkpoints = globalStorage.getCheckpoints();

        if (this.checkpoints.length > 0) {
            this.x = this.checkpoints[this.checkpoints.length - 1].x * 8;
            this.y = this.checkpoints[this.checkpoints.length - 1].y * 8;
        }
    }

    public init(): void {
        apate.input.on(apate.input.getButton("checkpoint"), "down", () => {
            if (this.handleInput && this.isGounded) {
                let x = Math.floor((this.x + 2) / 8);
                let y = Math.round((this.y + 2) / 8);

                if (!globalStorage.setCheckpoint(x, y)) {
                    globalStorage.removeCheckpoint(x, y);
                    this.die();
                }
            }
        });

        apate.input.on(apate.input.getButton("restart"), "down", () => {
            restart();
        });
    }

    update(delta: number) {
        this.partilces.update(delta);
        if (this.isDead) return;

        if (delta > 100 && this.isGounded) return; // prevent player to fall when out of focus

        let axis = apate.input.getAxis();

        if (!this.handleInput) axis = { v: 0, h: 0 };

        if (axis.h > 0) this.facingRight = true;
        else if (axis.h < 0) this.facingRight = false;

        if (Math.abs(axis.h) > 0) {
            this.isWalking = true;
            this.currentAnim = "walk";
        }

        if (this.isWallJumping) {
            this.velX += (this.velX * 0.75 - this.velX) * delta * 0.02;
            if (Math.abs(this.velX) < 1) this.isWallJumping = false;
        } else {
            this.velX = axis.h * this.speed;
        }

        if (this.isWalking) {
            this.nextFrame -= delta;
            if (this.nextFrame < 0) {
                this.nextFrame = 1000 / 10;
                this.currentFrame++;
                if (this.currentFrame >= 4) this.currentFrame = 0;
            }
        }

        if (this.velY < 0) {
            this.currentAnim = "jump";
            this.currentFrame = 0;
        } else if (this.velY > 0) {
            this.currentAnim = "fall";
            this.currentFrame = 0;
        } else this.currentAnim = "walk";

        if (this.velX == 0) {
            this.currentFrame = 0;
            this.isWalking = false;
        }

        if (this.handleInput && apate.input.isButtonDown("action1")) {
            if (this.isGounded) {
                this.isGounded = false;
                this.velY = -this.jumpForce;
            } else {
                let tile = this.tilemap.getTile(Math.floor((this.x + (this.facingRight ? 6 : -2)) / 8), Math.floor((this.y + 2) / 8));

                if (
                    (this.touchingLeftWall ||
                        this.touchingRightWall ||
                        (tile && tile.isMesh && !tile.name.includes("spike") && tile.name != "finish")) &&
                    this.velY > 0
                ) {
                    this.velY = -this.jumpForce;

                    if (tile && this.facingRight) this.touchingRightWall = true;
                    else if (tile && !this.facingRight) this.touchingLeftWall = true;

                    if (this.touchingLeftWall) {
                        this.velX = this.jumpForce;
                        this.facingRight = true;
                    } else if (this.touchingRightWall) {
                        this.velX = -this.jumpForce;
                        this.facingRight = false;
                    }

                    this.isWallJumping = true;
                    this.touchingLeftWall = false;
                    this.touchingRightWall = false;
                }
            }
        }

        if ((this.touchingLeftWall || this.touchingRightWall) && this.velY > 0) {
            this.velY = this.wallSlidingSpeed;
            if (this.touchingLeftWall) this.facingRight = true;
            else if (this.touchingRightWall) this.facingRight = false;
        }

        if (this.handleInput && (apate.input.isButtonDown("action2") || apate.input.isMousePressed)) {
            if (this.canTeleport && this.canThrow) {
                this.canTeleport = false;
                this.canThrow = false;
                this.isTeleporting = true;

                this.teleportX = this.x + 4;
                this.teleportY = this.y + 4;

                this.teleportingRight = this.facingRight;
            }
        } else this.canThrow = true;

        if (this.facingRight) this.spriteOffsetX = 3;
        else this.spriteOffsetX = 1;

        this.physicUpdate(delta);
    }

    tileCache: { lastX: number; lastY: number; tiles: Tile[] } = { lastX: -1, lastY: -1, tiles: [] };

    physicUpdate(delta) {
        // physics
        this.velX += this.forceX * 0.02 * delta;
        this.velY += (this.forceY + this.gravity) * 0.02 * delta;

        //this.forceX *= this.friction * 0.02 * delta;
        //this.forceY *= this.friction * 0.02 * delta;

        if (Math.abs(this.forceX) < 0.01) this.forceX = 0;
        if (Math.abs(this.forceY) < 0.01) this.forceY = 0;

        // collision cache
        if (Math.floor(this.x / 8) != this.tileCache.lastX || Math.floor(this.y / 8) != this.tileCache.lastY) {
            this.tileCache.lastX = Math.floor(this.x / 8);
            this.tileCache.lastY = Math.floor(this.y / 8);
            this.tileCache.tiles = this.tilemap
                .getSurroundingTiles(this.tileCache.lastX, this.tileCache.lastY)
                .filter((t) => t && t.isMesh);
        }

        this.touchingLeftWall = false;
        this.touchingRightWall = false;
        this.isGounded = false;

        // collision checks and resolves (x -> axis first)
        for (let axis = 0; axis < 2; axis++) {
            if (axis == 0) this.x += this.velX * delta * 0.02;
            else this.y += this.velY * delta * 0.02;

            for (let i = 0; i < this.tileCache.tiles.length; i++) {
                if (this.tileCache.tiles[i]?.isMesh) {
                    // define obstacle hitbox
                    let obstacle = { x: this.tileCache.tiles[i].x * 8, y: this.tileCache.tiles[i].y * 8, w: 8, h: 8 };

                    if (this.tileCache.tiles[i].name.startsWith("spike")) {
                        obstacle.y += 2;
                        obstacle.x += 2;
                        obstacle.h = 4;
                        obstacle.w = 4;
                    }

                    // check for collision
                    if (this.isCollidingWith(obstacle.x, obstacle.y, obstacle.w, obstacle.h)) {
                        if (this.tileCache.tiles[i].name == "finish") this.changeLevel();
                        else if (this.tileCache.tiles[i].name == "previous") this.changeLevel(true);
                        else if (this.tileCache.tiles[i].name.startsWith("spike")) this.die();

                        // resolve
                        let info = this.getCollisionInfo(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
                        if (axis == 0) {
                            // x-axis
                            if (this.velX > 0) {
                                this.x -= info.left;
                                this.velX = 0;
                                this.touchingRightWall = true;
                            } else if (this.velX < 0) {
                                this.x += info.right;
                                this.velX = 0;
                                this.touchingLeftWall = true;
                            }
                        } else {
                            // y-axis
                            if (this.velY > 0) {
                                this.y -= info.top;
                                this.velY = 0;
                                this.isGounded = true;
                            } else if (this.velY < 0) {
                                this.y += info.bottom;
                                this.velY = 0;
                            }
                        }
                    }
                }
            }
        }

        // handle cookies
        for (let c = 0; c < this.lvlData.cookies.length; c++) {
            if (this.isCollidingWith(this.lvlData.cookies[c].x + 1, this.lvlData.cookies[c].y + 1, 6, 6)) {
                let removed = this.lvlData.cookies.splice(c, 1)[0];
                c--;

                this.tilemap.tile(removed.x / 8, removed.y / 8, "");
                this.eatCookie(removed);
            }
        }

        // teleport collision check
        if (this.isTeleporting) {
            this.teleportX += (this.teleportingRight ? this.teleportSpeed : -this.teleportSpeed) * 0.02 * delta;

            let tile = this.tilemap.getTile(Math.floor(this.teleportX / 8), Math.floor(this.teleportY / 8));
            if (tile && tile.isMesh) {
                this.isTeleporting = false;
                this.canTeleport = true;

                if (tile.name.includes("door") && tile.name.includes("red")) {
                    this.canTeleport = false;
                    this.onRedDoorHit();
                    return;
                }

                this.x = tile.x * 8 + (this.teleportingRight ? -4 : 8);
                this.y = tile.y * 8;

                this.velY = 0;
                this.velX = 0;

                if (tile.name.startsWith("spike")) this.die();
                else if (tile.name == "finish") this.changeLevel();
                else if (tile.name == "previous") this.changeLevel(true);
            }
        }
    }
    public onRedDoorHit() {}

    isCollidingWith(x: number, y: number, w: number, h: number) {
        return apate.physic.isCollision(this.x, this.y, 4, 8, x, y, w, h);
    }

    getCollisionInfo(x: number, y: number, w: number, h: number) {
        return apate.physic.getCollisionInfo(this.x, this.y, 4, 8, x, y, w, h);
    }

    draw(drawlib: DrawLib) {
        if (apate.showInfo) {
            if (this.tileCache) {
                for (const tile of this.tileCache.tiles) {
                    drawlib.rect(tile.x * 8, tile.y * 8, 8, 8, Color.green);
                }
            }
            drawlib.text(
                1 + apate.screenOffset.x,
                8 - apate.screenOffset.y,
                "x: " + this.x.toFixed(4) + " - y: " + this.y.toFixed(4),
                Color.white
            );
        }

        for (let i = 0; i < this.checkpoints.length; i++) {
            drawlib.sprite(this.checkpoints[i].x * 8, this.checkpoints[i].y * 8, spriteLoader.getSprite("checkpoint"));
        }

        if (!this.isDead) {
            apate.draw.sprite(
                Math.round(this.x) - this.spriteOffsetX,
                Math.round(this.y),
                spriteLoader.getAnimatedSprite("player_" + this.currentAnim + (this.facingRight ? "_right" : "_left"), this.currentFrame)
            );
        }

        if (this.isTeleporting) {
            drawlib.pixel(Math.round(this.teleportX), Math.round(this.teleportY), Color.white);
            drawlib.pixel(Math.round(this.teleportX) + (this.facingRight ? -1 : 1), Math.round(this.teleportY), Color.red);
            drawlib.pixel(Math.round(this.teleportX) + (this.facingRight ? -2 : 2), Math.round(this.teleportY), Color.dark_red);
        }

        if (apate.showInfo) {
            apate.draw.pixel(Math.floor(this.x + 2), Math.round(this.y), Color.yellow);

            apate.draw.rect(
                Math.floor((this.x + (this.facingRight ? 6 : -2)) / 8) * 8,
                Math.round((this.y + 2) / 8) * 8,
                8,
                8,
                Color.orange
            );
            apate.draw.rect(Math.round(this.x), Math.round(this.y), 4, 8, Color.light_green); // hitbox
        }
        this.partilces.draw(drawlib);
    }

    eatCookie(cookie: { x: number; y: number }) {
        globalStorage.ateCookie(cookie);

        for (let i = 0; i < 20; i++) {
            this.partilces.spawn({
                x: cookie.x + this.apate.random.betweenInt(1, 6),
                y: cookie.y + this.apate.random.betweenInt(1, 6),
                color: this.apate.random.next() > 0.5 ? Color.brown : Color.orange,
                velX: this.apate.random.between(-0.5, 0.5),
                velY: this.apate.random.between(-0.5, 0.5),
                gravityY: 2,
                gravityX: 0,
                lifetime: 100,
                scale: 1,
            });
        }
    }

    die() {
        this.isDead = true;
        globalStorage.playerDied();

        audio.playTrack("dead");

        for (let i = 0; i < 20; i++) {
            this.partilces.spawn({
                x: this.x + this.apate.random.betweenInt(0, 9),
                y: this.y + this.apate.random.betweenInt(0, 9),
                color: this.apate.random.next() > 0.5 ? Color.light_purple : Color.purple,
                velX: this.apate.random.between(-1, 1),
                velY: this.apate.random.between(-1, 1),
                gravityY: 4,
                gravityX: 0,
                lifetime: 200,
                scale: 1,
            });
        }
        transition.focus.x = Math.round(this.x);
        transition.focus.y = Math.round(this.y);
        levelLoader.restart();
    }

    changeLevel(previous = false) {
        if (previous) return;

        this.doUpdate = false;

        transition.focus.x = Math.round(this.x);
        transition.focus.y = Math.round(this.y);

        /*if (previous) levelLoader.loadPrevious(); // TODO: set player position in previous level
        else levelLoader.loadNext();*/

        levelLoader.loadNext();
    }
}
