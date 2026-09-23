# Levaria PvP Club

A complete, configurable PvP club addon for Minecraft Bedrock 1.26.50+.

## Features

- Unranked and ranked 1v1 queues
- Team fight queue (2v2-ready party flow)
- Elo, seven ranks, wins, losses, K/D and streaks
- Sword, Axe, Dia Pot, Neth Pot, UHC, Mace and Mace SMP kits
- Kit selection and admin kit editor
- Arena rotation with configurable world locations
- Match countdown, teleportation, inventory snapshots and cleanup
- Player profile and top-player leaderboard menus
- World leaderboard hologram-style text display
- Admin setup menus for lobby, arenas and ratings
- Persistent data using dynamic properties

## Installation

1. Import both `behavior_packs/levaria_pvp_club` and `resource_packs/levaria_pvp_club` into your world, or zip each directory and import them.
2. Enable the behavior pack. Enable Beta APIs only if your platform requires it for the selected Script API version.
3. Give operators access to the setup commands.
4. Run `/lpc admin` and configure the lobby and arenas.

## Player commands

- `/lpc` — open the main menu
- `/lpc queue` — open queue selection
- `/lpc stats [player]` — view a profile
- `/lpc leaderboard` — view leaderboards
- `/lpc leave` — leave a queue or match

## Admin commands

- `/lpc admin` — open administration
- `/lpc arena add <name> <kit>` — add an arena at your current location
- `/lpc arena setspawn <name> <1|2>` — set an arena spawn
- `/lpc arena setreset <name>` — set the reset center
- `/lpc arena remove <name>` — remove an arena
- `/lpc kit editor` — create or edit custom kits
- `/lpc lobby set` — set the lobby
- `/lpc ratings reset <player>` — reset a player's Elo

## Configuration

Edit `scripts/config.js` for default Elo, match countdown, arena reset radius, admin tag, and kit definitions. Runtime arena and custom-kit data is stored in world dynamic properties.
