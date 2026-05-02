export const spriteManifest = {
  player: {
    displayWidth: 42,
    displayHeight: 48,
    animations: {
      down: ["sprites/player/down_0.png", "sprites/player/down_1.png", "sprites/player/down_2.png"],
      up: ["sprites/player/up_0.png", "sprites/player/up_1.png", "sprites/player/up_2.png"],
      side: ["sprites/player/side_0.png", "sprites/player/side_1.png", "sprites/player/side_2.png"],
    },
  },
  goblin: {
    displayWidth: 42,
    displayHeight: 48,
    sideFaces: "left",
    animations: {
      down: ["sprites/goblin/down_0.png", "sprites/goblin/down_1.png"],
      up: ["sprites/goblin/up_0.png", "sprites/goblin/up_1.png"],
      side: ["sprites/goblin/side_0.png", "sprites/goblin/side_1.png"],
    },
  },
  sword: {
    image: "sprites/items/sword.png",
    displayWidth: 14,
    displayHeight: 42,
    baseDirection: "up",
  },
  coin: {
    displayWidth: 22,
    displayHeight: 22,
    animations: {
      spin: ["sprites/coin/spin_0.png", "sprites/coin/spin_1.png", "sprites/coin/spin_2.png", "sprites/coin/spin_3.png"],
    },
  },
  tiles: {
    background: "sprites/tiles/background_playfield.png",
    floor: "sprites/tiles/floor.png",
    wall: "sprites/tiles/wall.png",
  },
};
