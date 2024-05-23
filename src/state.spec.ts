import { describe, it, expect, beforeEach } from "bun:test";
import {
    applyPlayerEventToState,
    validateEvent,
    type State,
    type PlayerEvent,
    type Position,
} from "./state";

describe("applyPlayerEventToState", () => {
    let initialState: State;

    beforeEach(() => {
        initialState = {
            room: {
                id: "room1",
                objects: {
                    walls: [
                        {
                            id: "1",
                            area: {
                                top: 2,
                                right: 4,
                                bottom: 4,
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
                    id: "player1",
                    position: { x: 0, y: 0 },
                    color: "red",
                },
                {
                    id: "player2",
                    position: { x: 1, y: 1 },
                    color: "blue",
                },
            ],
        };
    });

    it("should add a new player", () => {
        const newPlayer = {
            id: "player3",
            position: { x: 5, y: 5 },
            color: "green",
        };
        const event: PlayerEvent = {
            kind: "add",
            player: newPlayer,
        };

        const newState = applyPlayerEventToState(initialState, event);

        expect(newState.players).toHaveLength(3);
        expect(newState.players).toContainEqual(newPlayer);
    });

    it("should remove an existing player", () => {
        const event: PlayerEvent = {
            kind: "remove",
            playerId: "player1",
        };

        const newState = applyPlayerEventToState(initialState, event);

        expect(newState.players).toHaveLength(1);
        expect(newState.players).not.toContainEqual(
            expect.objectContaining({ id: "player1" }),
        );
    });

    it("should move an existing player", () => {
        const newPosition: Position = { x: 3, y: 3 };
        const event: PlayerEvent = {
            kind: "move",
            playerId: "player1",
            position: newPosition,
        };

        const newState = applyPlayerEventToState(initialState, event);

        expect(newState.players).toHaveLength(2);
        expect(newState.players).toContainEqual(
            expect.objectContaining({ id: "player1", position: newPosition }),
        );
    });

    it("should not affect other players when moving a player", () => {
        const newPosition: Position = { x: 3, y: 3 };
        const event: PlayerEvent = {
            kind: "move",
            playerId: "player1",
            position: newPosition,
        };

        const newState = applyPlayerEventToState(initialState, event);

        const otherPlayer = newState.players.find(
            (player) => player.id === "player2",
        )!;
        expect(otherPlayer.position).toEqual({ x: 1, y: 1 });
    });
});

describe("validateEvent", () => {
    let initialState: State;

    beforeEach(() => {
        initialState = {
            room: {
                id: "room1",
                objects: {
                    walls: [
                        {
                            id: "1",
                            area: {
                                top: 2,
                                right: 4,
                                bottom: 4,
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
                    id: "player1",
                    position: { x: 0, y: 0 },
                    color: "red",
                },
                {
                    id: "player2",
                    position: { x: 1, y: 1 },
                    color: "blue",
                },
            ],
        };
    });

    it("should validate adding a new player", () => {
        const newPlayer = {
            id: "player3",
            position: { x: 5, y: 5 },
            color: "green",
        };
        const event: PlayerEvent = {
            kind: "add",
            player: newPlayer,
        };

        expect(validateEvent(initialState, event)).toBe(true);
    });

    it("should invalidate adding a player with duplicate id", () => {
        const newPlayer = {
            id: "player1",
            position: { x: 5, y: 5 },
            color: "green",
        };
        const event: PlayerEvent = {
            kind: "add",
            player: newPlayer,
        };

        expect(validateEvent(initialState, event)).toBe(false);
    });

    it("should validate removing an existing player", () => {
        const event: PlayerEvent = {
            kind: "remove",
            playerId: "player1",
        };

        expect(validateEvent(initialState, event)).toBe(true);
    });

    it("should invalidate removing a non-existent player", () => {
        const event: PlayerEvent = {
            kind: "remove",
            playerId: "nonExistentPlayer",
        };

        expect(validateEvent(initialState, event)).toBe(false);
    });

    it("should validate moving a player within room bounds and outside walls", () => {
        const newPosition: Position = { x: 1, y: 1 };
        const event: PlayerEvent = {
            kind: "move",
            playerId: "player1",
            position: newPosition,
        };

        expect(validateEvent(initialState, event)).toBe(true);
    });

    it("should invalidate moving a player outside room bounds", () => {
        const newPosition: Position = { x: 11, y: 11 };
        const event: PlayerEvent = {
            kind: "move",
            playerId: "player1",
            position: newPosition,
        };

        expect(validateEvent(initialState, event)).toBe(false);
    });

    it("should invalidate moving a player inside a wall", () => {
        const newPosition: Position = { x: 3, y: 3 };
        const event: PlayerEvent = {
            kind: "move",
            playerId: "player1",
            position: newPosition,
        };

        expect(validateEvent(initialState, event)).toBe(false);
    });
});
