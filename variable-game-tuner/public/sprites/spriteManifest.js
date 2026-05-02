// First-pass sprite manifest for the Variable Game Tuner.
// These files were sliced from an AI-generated sprite sheet.
// Frame sizes vary because each source crop is tuned for the generated art.
// The renderer should draw these centered at a consistent game-world size.

export const spriteManifest = {
  player: {
    displayWidth: 42,
    displayHeight: 48,
    animations: {
      down: [
        "/sprites/player/down_0.png",
        "/sprites/player/down_1.png",
        "/sprites/player/down_2.png",
      ],
      up: [
        "/sprites/player/up_0.png",
        "/sprites/player/up_1.png",
        "/sprites/player/up_2.png",
      ],
      side: [
        "/sprites/player/side_0.png",
        "/sprites/player/side_1.png",
        "/sprites/player/side_2.png",
      ],
    },
    mirrorSideForLeft: true,
  },

  goblin: {
    displayWidth: 42,
    displayHeight: 48,
    animations: {
      down: [
        "/sprites/goblin/down_0.png",
        "/sprites/goblin/down_1.png",
      ],
      up: [
        "/sprites/goblin/up_0.png",
        "/sprites/goblin/up_1.png",
      ],
      side: [
        "/sprites/goblin/side_0.png",
        "/sprites/goblin/side_1.png",
      ],
    },
    mirrorSideForLeft: true,
  },

  sword: {
    image: "/sprites/items/sword.png",
    displayWidth: 14,
    displayHeight: 42,
    rotateByDirection: true,
    // Adjust later if the sword appears pointed the wrong way.
    baseDirection: "up",
  },

  coin: {
    displayWidth: 22,
    displayHeight: 22,
    animations: {
      spin: [
        "/sprites/coin/spin_0.png",
        "/sprites/coin/spin_1.png",
        "/sprites/coin/spin_2.png",
        "/sprites/coin/spin_3.png",
      ],
    },
  },

  tiles: {
    floor: "/sprites/tiles/floor.png",
    wall: "/sprites/tiles/wall.png",
  },
};
