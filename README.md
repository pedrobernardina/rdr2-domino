# RDR2 Domino

Tile tracker and move advisor for the dominoes minigame in Red Dead Redemption 2.

**Live:** https://pedrobernardina.github.io/rdr2-domino/

Built for the **Draw** variant played **1v1**, to help you complete **Gambler Challenge #9**: *"Win three games of Dominoes in a row."* Yes, it's a bit tedious to manage everything by hand while you play, but the goal is simple: get the challenge done and move on with your life.

## How to use

1. **Mark your tiles.** Click a tile to cycle it: unknown → Arthur (blue) → table (faded). Right-click goes back one step.
2. **Set the open ends.** Pick ends A and B at the top of the side panel after each play.
3. **Keep the opponent's hand count in sync.** The game shows how many tiles he holds; mirror it with − and +.
4. **Press "Opponent drew"** whenever he draws. He can't hold the current end numbers, and the app remembers that. When the boneyard is empty the button becomes "Opponent passed".
5. **Follow the suggestion.** The best move is highlighted on the board. Every alternative lists its reasons: whether it blocks him, whether you keep a follow-up, how many points it sheds.

Each number's tiles are shown once, in a triangle: tile `i|j` sits at row `i`, column `j`, so every tile with a given number lies on its row plus its column. Hover a number to highlight them. Next to each row you'll see how many tiles with that number are still unseen and the chance he holds one.

Your round is saved in the browser, so closing the tab doesn't lose it. The interface is available in English and Portuguese (PT/EN toggle at the top).

### Tips

- In Draw, the first to 60 points wins the game. Draw is played at the Emerald Ranch train station.
- Wait for a table with a single opponent: odds are much better 1v1 than against two or three.

## Run locally

```sh
pnpm install
pnpm dev     # http://localhost:5173/rdr2-domino/
pnpm test    # logic tests: odds, clues, suggestions
```

## Contributing

Want improvements? Feel free to fork, just leave a star ⭐. I hope it helps you as much as it helped me.

## License

[MIT](LICENSE)
