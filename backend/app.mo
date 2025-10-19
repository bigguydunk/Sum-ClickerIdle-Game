import Nat "mo:base/Nat";

import Array "mo:base/Array";

persistent actor ClickerGame {
  // Store game state
  var exp: Nat = 0;
  var totalClicks: Nat = 0;
  var expPerClick: Nat = 1;
  var expPerSecond: Nat = 0;
  var shopOwned: [Nat] = Array.freeze(Array.init<Nat>(8, 0)); // 8 shop items

  // Save game state (all progress)
  public func saveGame(
    newExp: Nat,
    newTotalClicks: Nat,
    newExpPerClick: Nat,
    newExpPerSecond: Nat,
    newShopOwned: [Nat]
  ): async () {
    exp := newExp;
    totalClicks := newTotalClicks;
    expPerClick := newExpPerClick;
    expPerSecond := newExpPerSecond;
    shopOwned := newShopOwned;
  };

  // Get all game state
  public query func getGameState(): async {
    exp: Nat;
    totalClicks: Nat;
    expPerClick: Nat;
    expPerSecond: Nat;
    shopOwned: [Nat];
  } {
    return {
      exp = exp;
      totalClicks = totalClicks;
      expPerClick = expPerClick;
      expPerSecond = expPerSecond;
      shopOwned = shopOwned;
    };
  };

  // Reset the game
  public func resetGame(): async () {
    exp := 0;
    totalClicks := 0;
    expPerClick := 1;
    expPerSecond := 0;
  shopOwned := Array.freeze(Array.init<Nat>(8, 0));
  };
};
