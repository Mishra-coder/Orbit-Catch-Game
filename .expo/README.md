# Orbit Catch Game

This project implements **Orbit Catch**, a simple reflex-based game built with **Expo** and **React Native**.

## Game Overview
- A ball launches from the center of the screen and moves outward.
- A rotating shield surrounds the central core. Tap the screen to reverse the shield's rotation direction.
- Catch the ball with the shield to score points. Missing the ball ends the game.
- The game runs at a very slow speed (shield speed `0.5°/frame`, ball speed `0.5` units) for an easy, relaxed experience.

## Controls
- **Tap** anywhere on the screen to reverse the shield's rotation.
- The game starts automatically on the first tap.

## Features
- Smooth 60 fps animation using the `Animated` API.
- Score tracking and a game‑over overlay.
- Minimal UI with a dark neon aesthetic.

## Development
- Run the app with `npm start` (Expo Go or a compatible simulator).
- Edit `App.js` to tweak speeds, colors, or add new features.

Enjoy the game and feel free to customize it further!
