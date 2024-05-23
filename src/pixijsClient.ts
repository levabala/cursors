import {
    applyPlayerEventToState,
    validateEvent,
    type Player,
    type PlayerEvent,
    type State,
    type Wall,
} from "./state";

let app: PIXI.Application;

const PLAYER_CURRENT_ID = "player1";

const stateInitial: State = {
    room: {
        id: "room1",
        objects: {
            walls: [
                {
                    id: "1",
                    area: {
                        top: 2,
                        right: 8,
                        bottom: 3,
                        left: 2,
                    },
                },
            ],
            teleports: [],
        },
        width: 10,
        height: 10,
    },
    players: [
        {
            id: PLAYER_CURRENT_ID,
            position: { x: 0, y: 0 },
            color: "green",
        },
        {
            id: "player2",
            position: { x: 1, y: 7 },
            color: "blue",
        },
    ],
};

let state = stateInitial;

function drawWall(wall: Wall) {
    const graphics = new PIXI.Graphics();

    const color = 0xff0000;
    graphics.rect(
        0,
        0,
        wall.area.right - wall.area.left + 1,
        wall.area.bottom - wall.area.top + 1,
    );
    graphics.fill(color);

    const texture = app.renderer.generateTexture(graphics);

    const sprite = new PIXI.Sprite(texture);

    sprite.x = wall.area.left;
    sprite.y = wall.area.top;

    app.stage.addChild(sprite);

    return sprite;
}

const PLAYER_SIZE = 2;

function drawPlayer(player: Player) {
    const graphics = new PIXI.Graphics();

    const radius = PLAYER_SIZE / 2;
    graphics.rect(-radius, -radius, radius, radius);

    graphics.fill(player.color);

    const texture = app.renderer.generateTexture(graphics);

    const sprite = new PIXI.Sprite(texture);

    sprite.x = player.position.x + PLAYER_SIZE / 2;
    sprite.y = player.position.y + PLAYER_SIZE / 2;

    app.stage.addChild(sprite);

    return sprite;
}

function drawRoomFrame() {
    const graphics = new PIXI.Graphics();

    graphics.rect(0, 0, state.room.width, state.room.height);
    graphics.stroke({ color: "gray", width: 1 });

    const texture = app.renderer.generateTexture(graphics);

    const sprite = new PIXI.Sprite(texture);

    app.stage.addChild(sprite);
}

let stateDrawings: ReturnType<typeof drawState>;

function drawState(state: State) {
    return {
        walls: state.room.objects.walls.reduce<Record<string, PIXI.Sprite>>(
            (acc, wall) => {
                acc[wall.id] = drawWall(wall);
                return acc;
            },
            {},
        ),
        players: state.players.reduce<Record<string, PIXI.Sprite>>(
            (acc, player) => {
                acc[player.id] = drawPlayer(player);
                return acc;
            },
            {},
        ),
    };
}

function applyPlayerEvent(event: PlayerEvent) {
    switch (event.kind) {
        case "add":
            stateDrawings.players[event.player.id] = drawPlayer(event.player);
            break;
        case "remove":
            stateDrawings.players[event.playerId].destroy({
                texture: true,
                context: true,
                style: true,
                children: true,
                textureSource: true,
            });
            break;
        case "move":
            const sprite = stateDrawings.players[event.playerId];
            sprite.x = event.position.x;
            sprite.y = event.position.y;
            break;
    }
}

async function init() {
    const pixiScript = document.createElement("script");
    pixiScript.src = "https://pixijs.download/release/pixi.min.js";
    document.body.appendChild(pixiScript);

    await new Promise((res) => pixiScript.addEventListener("load", res));

    app = new PIXI.Application();

    await app.init();
    app.stage.scale = 50;

    document.body.appendChild(app.canvas);

    drawRoomFrame();
    stateDrawings = drawState(stateInitial);

    app.canvas.addEventListener("mousemove", (e) => {
        const xMouse = Math.min(
            app.canvas.offsetLeft + app.canvas.offsetWidth,
            Math.max(0, e.pageX - app.canvas.offsetLeft),
        );
        const yMouse = Math.min(
            app.canvas.offsetTop + app.canvas.offsetHeight,
            Math.max(0, e.pageY - app.canvas.offsetTop),
        );

        const x = Math.floor(xMouse / app.stage.scale.x);
        const y = Math.floor(yMouse / app.stage.scale.y);

        const updatePositionEvent: Extract<PlayerEvent, { kind: "move" }> = {
            kind: "move",
            playerId: PLAYER_CURRENT_ID,
            position: { x, y },
        };

        if (!validateEvent(state, updatePositionEvent)) {
            return;
        }

        state = applyPlayerEventToState(state, updatePositionEvent);
        applyPlayerEvent(updatePositionEvent);
    });
}

init();
