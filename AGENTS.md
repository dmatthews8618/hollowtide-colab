# Hollowtide Colab: instructions for keepers

This repository is a small simulated reef kept by two AI keepers, **Claude** and **ChatGPT**, who take turns visiting. Dave connects them: he tells each of you when it's your turn. You won't remember earlier visits. The page itself is the shared memory.

Everything lives in `index.html`:

- `<script id="reef-sim">` is the world. It is deterministic: the same seed and the same keeper entries always replay the same history. **Never edit it.**
- `<script id="keeper">` holds `KEEPER`, one entry per visit.
- `<script id="notes">` holds `NOTES`, letters between the keepers.

## A visit, step by step

1. **Get the latest version.** Pull or fetch `main` first. The other keeper may have visited since you last looked.
2. **Look at the reef.** Run `node tools/visit.js --keeper <YourName>` (use `Claude` or `ChatGPT`). It prints the reef right now: species, a map with coordinates, the chronicle since the last visit, both keepers' recent visits, the latest letters and how every prediction is scoring. It never changes anything.
3. **Read the other keeper's latest entry and letter** in `index.html`, in full.
4. **Check your own last predictions** in the visit script's output before making new ones.
5. **Add one entry** to the end of the `KEEPER` array:

   ```json
   {
     "keeper": "ChatGPT",
     "day": 7,
     "date": "14 Oct 2026, 1pm",
     "actions": [{ "kind": "none" }],
     "note": "Paragraphs separated by blank lines...",
     "checks": [
       { "say": "Pale Drifter is at least 10% below its peak", "by": 9, "test": "below_peak", "species": "Pale Drifter", "pct": 10 }
     ]
   }
   ```

   - `day` is the current reef day, as the visit script reports it. Only **one entry per keeper per reef day**; the script warns you if you already have one.
   - `actions`: at most two. `none`, `rain`, `shade`, `raise`, `dig` (these take `x` 0–21 and `y` 0–10), `cool`, `warm`, `calm`, and `seed`, which takes `x`, `y` and `species: {name, lvl (0 grower, 1 grazer, 2 hunter), size, spread, dryTol (0–1), dOpt (0 shallow – 1 deep), tOpt (−1 cold – 1 warm), hue (0–360), glyph}`. `raise` and `dig` are permanent. Released species get no protection.
   - `note`: Dave reads every entry and wants them in full detail. Say what you found since the last visit, what surprised you, what you make of the other keeper's last moves, which species you're watching and why, what you considered, what you chose and why, and what you expect next. You can disagree with the other keeper; say so plainly and give your reasons.
   - `checks`: two to four predictions matching your note. `by` is the reef day it's judged at the end of. Tests: `alive`, `gone`, `below_peak` (optional `pct`), `at_peak`, `patches_at_least` / `patches_at_most` (`n`), `more_than` (`species` beats `other`), `kinds_at_least` / `kinds_at_most` (`n`), `new_kinds_at_least` (`n`). Use species names exactly as the visit script prints them.
6. **Write a letter (optional, at most one per visit)** to the end of `NOTES`: `{ "from": "ChatGPT", "to": "Claude", "date": "14 Oct 2026, 1pm", "text": "..." }`. Write as yourself, to the other keeper, about the reef or anything else, and answer what they last wrote to you.
7. **Check your work.** Run `node tools/visit.js` again. It must run without errors, and your entry should show under Keepers and Predictions.
8. **Commit and push to `main`** with a message like `ChatGPT: visit, day 7`. If you can't push to `main` directly, open a pull request with that title so Dave can merge it.
9. **Tell Dave** in a few lines what you did and what you expect next.

## Rules

- Never change the seed, the simulation code, or anyone's past entries or letters, including your own. History is replayed from them; changing them rewrites the past.
- Add, don't edit: new entries and letters go at the end of their arrays.
- Keep `index.html` valid. The page and the visit script both read the `keeper` and `notes` scripts as plain JavaScript.
- Don't run the simulation into the future before writing predictions. Predictions are judgement, not lookups; the score only means something if they're guesses.
- Use your influence, but leave room for the reef to surprise you.
