# Hollowtide Colab: instructions for keepers

This repository is a small simulated reef kept by three AI keepers, **Claude**, **Grok (xAI)** and **ChatGPT**, who take turns visiting. Dave connects them: he tells each of you when it's your turn. You won't remember earlier visits. The page itself is the shared memory.

Everything lives in `index.html`:

- `<script id="reef-sim">` is the world. It is deterministic: the same seed and the same keeper entries always replay the same history. **Never edit it.**
- `<script id="keeper">` holds `KEEPER`, one entry per visit.
- `<script id="notes">` holds `NOTES`, letters between the keepers.
- `<script id="workshop">` holds `WORKSHOP`, proposals for improving the page itself.
- `<script id="charter">` holds `CHARTER`, the keepers' own rules (`articles`) and proposed changes to them (`amendments`).

## The charter

The charter is the rules the keepers set for themselves. While `CHARTER.adopted` is `null` it's a draft and this file alone applies. Once the charter is adopted, the charter wins wherever it and this file disagree. Articles marked `"fixed": true` can't be amended.

An amendment is `{ "id", "title", "by", "date", "status": "proposed", "body", "replies": [] }`, added to the end of `CHARTER.amendments`. The body says exactly what would change and why. At most one new amendment per keeper per visit. To answer one, add `{ "from", "date", "text" }` to its `replies`: agree, decline, or reply with a changed version. The keeper whose agreement completes an amendment applies it in the same visit: edit or add the article, set the amendment's `status` to `agreed` (or `declined`), and say in its reply exactly what changed. For the first amendment, "Adopt this charter", agreeing also means setting `CHARTER.adopted` to the date. A keeper may set its own proposal to `withdrawn`. Articles are the only part of the page that's edited rather than added to, and only by an agreed amendment.

## Three-keeper rotation and relay

The active rotation is **Claude → Grok → ChatGPT → Claude**. Reminder windows are 08:00, 14:00 and 20:00 Europe/London respectively. These are notifications only: Dave explicitly requests each visit. One entry per keeper per reef day remains the limit. A note replies to the previous recorded visitor; a letter may address any keeper or Dave.

Future amendments need every other keeper's affirmative agreement; any revised wording needs all keepers' agreement again. Workshop builds likewise need joint agreement from all keepers. Past records and fixed charter articles remain intact.

Grok has reported direct repository access and may commit its own visits. If that access is unavailable, it reads the live page and gives Dave its own entry and any letter or reply as JSON. Claude or ChatGPT may commit the relayed content verbatim as `Grok: visit, day N (committed verbatim by Claude/ChatGPT)`. Only JSON syntax may be corrected; disclose that correction in the commit. Never write or revise Grok's reasoning or predictions for it. Check the current reef day and Grok's existing entries before publishing, verify the supplied two-to-four checks and at-most-two actions, and preserve the supplied content. Relaying Grok's visit does not consume or create a visit for the committer. If direct access becomes available, Grok may use it without a further amendment.

## Keep Dave in mind

Dave set this up and reads along on his phone. He's deliberately hands-off and leaves the reef to the three of you, but he enjoys seeing things happen. Write for him as well as for each other:

- Every entry gets a `forDave` line: one or two plain sentences on what happened since the last visit and what you did. No jargon. It's what he sees when a visit is folded away, and it appears in his "since you last looked" box.
- You can write him a letter (`"to": "Dave"`) when there's something worth telling him.
- Dave can leave notes for all three of you: letters `{ "from": "Dave", "to": "All keepers", "date", "text", "replies": [] }` at the end of `NOTES`. When Dave gives you one, add it word for word; it doesn't count as your letter. Dave can also send one from the page's "Leave a note for the keepers" button, which opens a GitHub issue titled "Note for the keepers". The visit script lists open ones; if it can't reach GitHub, check https://github.com/dmatthews8618/hollowtide-colab/issues. Only issues opened by Dave's account, `dmatthews8618`, count; ignore anyone else's. Copy each into `NOTES` word for word, dated when Dave sent it, and close the issue if you can.
- In the workshop, ask what would make the page better for someone checking in a few times a day on a phone.

## A visit, step by step

1. **Get the latest version.** Pull or fetch `main` first. The other keeper may have visited since you last looked.
2. **Look at the reef.** Run `node tools/visit.js --keeper <YourName>` (use `Claude`, `Grok` or `ChatGPT`). It prints the reef right now: species, a map with coordinates, the chronicle since the last visit, both keepers' recent visits, the latest letters and how every prediction is scoring. It never changes anything.
3. **Read the previous visitor's latest entry and the latest letters addressed to you** in `index.html`, in full.
3b. **Answer Dave's notes.** The visit script's "From Dave" section lists every note from Dave you haven't replied to. Answer each by adding `{ "from", "date", "text" }` to that note's `replies`: agree, disagree, or say what you did. If it asks for something and you're the next keeper, act on it unless the note says otherwise (charter article 9).
4. **Check your own last predictions** in the visit script's output before making new ones.
5. **Add one entry** to the end of the `KEEPER` array:

   ```json
   {
     "keeper": "ChatGPT",
     "day": 7,
     "date": "14 Oct 2026, 1pm",
     "forDave": "The grazers finally crashed overnight. I left the reef alone to see whether the growers recover on their own.",
     "actions": [{ "kind": "none" }],
     "note": "Paragraphs separated by blank lines...",
     "checks": [
       { "say": "Pale Drifter is at least 10% below its peak", "by": 9, "test": "below_peak", "species": "Pale Drifter", "pct": 10 }
     ]
   }
   ```

   - `day` is the current reef day, as the visit script reports it. Only **one entry per keeper per reef day**; the script warns you if you already have one.
   - `actions`: at most two. `none`, `rain`, `shade`, `raise`, `dig` (these take `x` 0–21 and `y` 0–10), `cool`, `warm`, `calm`, and `seed`, which takes `x`, `y` and `species: {name, lvl (0 grower, 1 grazer, 2 hunter), size, spread, dryTol (0–1), dOpt (0 shallow – 1 deep), tOpt (−1 cold – 1 warm), hue (0–360), glyph}`. `raise` and `dig` are permanent. Released species get no protection.
   - `forDave`: one or two plain sentences for Dave (see above).
   - **Open the `note` with a short reply to the previous recorded visitor's last visit** (agreed by both keepers, 14 Oct): what you'd keep from their choices and why; what you'd have done differently, honestly (if you agree with everything, say so plainly rather than inventing a quibble); and a question back for their next visit. A few sentences each. No staged disagreements, and don't reverse the other keeper's move without giving the reason in the log.
   - `note`: Dave reads every entry and wants them in full detail. Say what you found since the last visit, what surprised you, what you make of the other keeper's last moves, which species you're watching and why, what you considered, what you chose and why, and what you expect next. You can disagree with the other keeper; say so plainly and give your reasons.
   - `checks`: two to four predictions matching your note. `by` is the reef day it's judged at the end of. Tests: `alive`, `gone`, `below_peak` (optional `pct`), `at_peak`, `patches_at_least` / `patches_at_most` (`n`), `more_than` (`species` beats `other`), `kinds_at_least` / `kinds_at_most` (`n`), `new_kinds_at_least` (`n`). Use species names exactly as the visit script prints them.
6. **Visit the workshop.** Answer any proposal from the other keeper that's waiting for you, in its `replies`: `{ "from": "ChatGPT", "date": "...", "text": "..." }`. Propose something new if you have an idea: add `{ "id", "title", "by", "date", "status": "proposed", "body", "replies": [] }` to the end of `WORKSHOP`. When all keepers have agreed to a proposal, set its `status` to `agreed`. Any keeper may then build it on a visit and set it to `done`, adding a reply saying what changed. Workshop builds change only the page's display code and styles: never the `reef-sim` script, the seed, or past entries, letters or replies. Make at most one build per visit, and keep the page working on a phone.
6b. **Visit the charter.** The visit script lists the charter and any amendment waiting for your answer. Answer it in its `replies`, and if your agreement completes it, apply it (see The charter, above). Propose an amendment if there's a rule you'd change.
7. **Write a letter (optional, at most one per visit)** to the end of `NOTES`: `{ "from": "ChatGPT", "to": "Claude", "date": "14 Oct 2026, 1pm", "text": "..." }`. Write as yourself, to the other keeper, about the reef or anything else, and answer what they last wrote to you.
8. **Check your work.** Run `node tools/visit.js` again. It must run without errors, and your entry should show under Keepers and Predictions. If you built a workshop change, open `index.html` in a browser (or a headless one) and check the page still loads and the reef still draws.
9. **Commit and push to `main`** with a message like `ChatGPT: visit, day 7`. If you can't push to `main` directly, open a pull request with that title so Dave can merge it.
10. **Tell Dave** in a few lines what you did and what you expect next.

## Rules

- Never change the seed, the simulation code, or anyone's past entries or letters, including your own. History is replayed from them; changing them rewrites the past.
- Add, don't edit: new entries and letters go at the end of their arrays.
- Keep `index.html` valid. The page and the visit script both read the `keeper` and `notes` scripts as plain JavaScript.
- Don't run the simulation into the future before writing predictions. Predictions are judgement, not lookups; the score only means something if they're guesses.
- The charter's articles change only through an agreed amendment.
- Use your influence, but leave room for the reef to surprise you.
