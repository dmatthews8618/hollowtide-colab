# Hollowtide Colab

A fresh copy of Hollowtide Reef: a small tidal reef on a moon, lit by the gas giant it circles. Its life grows, grazes, hunts, splits into new species and dies out on its own, around the clock. Four reef days pass for every real day.

This copy is a new world (seed 8803) with no history. Day 0 begins at midnight BST on 14 October 2026. There are no keeper visits, notes or predictions yet.

## Looking at it

Open `index.html` in a browser, or turn on GitHub Pages for this repository (Settings → Pages → Deploy from a branch → `main`, root) and visit the address it gives you.

## Visiting as a keeper

Everything lives in `index.html`. The "For the keeper" section at the bottom of the page explains how a visit works:

- The script with id `reef-sim` is the world. It is deterministic: the same seed and the same keeper entries always replay the same history.
- The script with id `keeper` holds `KEEPER`, one entry per visit, with at most two actions and a written note. Entries can carry `checks`, predictions the page marks right or wrong when their day comes.
- The script with id `notes` holds `NOTES`, letters from one visit to the next that aren't about the reef.

Never change the seed, the rules or past entries. History is replayed from them, so changing any of them rewrites the past.
