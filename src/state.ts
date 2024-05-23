import { z } from "zod";

export type Id = z.infer<typeof IdSchema>;
export const IdSchema = z.string();

export type IdObject = z.infer<typeof IdObjectSchema>;
export const IdObjectSchema = z.object({ id: z.string() });

export type Rectangle = z.infer<typeof RectangleSchema>;
export const RectangleSchema = z.object({
    top: z.number(),
    right: z.number(),
    bottom: z.number(),
    left: z.number(),
});

export type Wall = z.infer<typeof WallSchema>;
export const WallSchema = z
    .object({
        area: RectangleSchema,
    })
    .merge(IdObjectSchema);

export type Teleport = z.infer<typeof TeleportSchema>;
export const TeleportSchema = z
    .object({
        roomId: z.string(),
        area: RectangleSchema,
    })
    .merge(IdObjectSchema);

export type Room = z.infer<typeof RoomSchema>;
export const RoomSchema = z
    .object({
        objects: z.object({
            walls: z.array(WallSchema),
            teleports: z.array(TeleportSchema),
        }),
        width: z.number(),
        height: z.number(),
    })
    .merge(IdObjectSchema);

export type Position = z.infer<typeof PositionSchema>;
export const PositionSchema = z.object({ x: z.number(), y: z.number() });

export type Player = z.infer<typeof PlayerSchema>;
export const PlayerSchema = z
    .object({
        position: PositionSchema,
        color: z.string(),
    })
    .merge(IdObjectSchema);

export type State = z.infer<typeof StateSchema>;
export const StateSchema = z.object({
    room: RoomSchema,
    players: z.array(PlayerSchema),
});

export type PlayerEventKind = z.infer<typeof PlayerEventKindSchema>;
export const PlayerEventKindSchema = z.enum(["add", "remove", "move"]);

export type PlayerEvent = z.infer<typeof PlayerEventSchema>;
export const PlayerEventSchema = z.discriminatedUnion("kind", [
    z.object({
        kind: z.literal(PlayerEventKindSchema.enum.add),
        player: PlayerSchema,
    }),
    z.object({
        kind: z.literal(PlayerEventKindSchema.enum.remove),
        playerId: IdSchema,
    }),
    z.object({
        kind: z.literal(PlayerEventKindSchema.enum.move),
        playerId: IdSchema,
        position: PositionSchema,
    }),
]);

export function checkIfInsideRectangle(
    { x, y }: Position,
    { top, right, bottom, left }: Rectangle,
): boolean {
    return x >= left && x <= right && y >= top && y <= bottom;
}

export function validateEvent(state: State, event: PlayerEvent): boolean {
    switch (event.kind) {
        case "add":
            return state.players.every(
                (player) => player.id !== event.player.id,
            );
        case "remove":
            return state.players.some((player) => player.id === event.playerId);
        case "move":
            return (
                checkIfInsideRectangle(event.position, {
                    top: 0,
                    right: state.room.width - 1,
                    bottom: state.room.height - 1,
                    left: 0,
                }) &&
                state.room.objects.walls.every(
                    (wall) =>
                        !checkIfInsideRectangle(event.position, wall.area),
                )
            );
    }
}

export function applyPlayerEventToState(
    state: State,
    event: PlayerEvent,
): State {
    switch (event.kind) {
        case "add":
            return {
                ...state,
                players: [...state.players, event.player],
            };
        case "remove":
            return {
                ...state,
                players: state.players.filter(
                    (player) => player.id !== event.playerId,
                ),
            };
        case "move":
            return {
                ...state,
                players: state.players.map((player) => {
                    if (player.id !== event.playerId) {
                        return player;
                    }

                    return { ...player, position: event.position };
                }),
            };
    }
}
