export function getWinMessage(config) {
  if (config.winCondition === 2) {
    return {
      title: "Goblins Defeated!",
      subtitle: "You cleared every enemy from the room.",
    };
  }

  if (config.winCondition === 3) {
    return {
      title: "Full Clear!",
      subtitle: "You collected every coin and defeated every goblin.",
    };
  }

  return {
    title: "Coins Collected!",
    subtitle: "You collected every coin in the room.",
  };
}
