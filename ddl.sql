CREATE TABLE `gamedevs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `gamedb` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `score` int NOT NULL,
  `fullclear` tinyint DEFAULT NULL,
  `developer_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `developer_id_FOREIGN_KEY_idx` (`developer_id`) /*!80000 INVISIBLE */,
  CONSTRAINT `developer_id_FOREIGN_KEY` FOREIGN KEY (`developer_id`) REFERENCES `gamedevs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS user;

CREATE TABLE user (
  id int NOT NULL AUTO_INCREMENT,
  username varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
    PRIMARY KEY(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * from games;

-- 7 Days to Die
INSERT INTO gamedevs (name) VALUES ('The Fun Pimps') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('7 Days to Die', (SELECT id FROM gamedevs WHERE name = 'The Fun Pimps')) ON DUPLICATE KEY UPDATE name=name;

-- Aimlabs
INSERT INTO gamedevs (name) VALUES ('Statespace') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Aimlabs', (SELECT id FROM gamedevs WHERE name = 'Statespace')) ON DUPLICATE KEY UPDATE name=name;

-- Albion Online
INSERT INTO gamedevs (name) VALUES ('Sandbox Interactive GmbH') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Albion Online', (SELECT id FROM gamedevs WHERE name = 'Sandbox Interactive GmbH')) ON DUPLICATE KEY UPDATE name=name;

-- Alchemy Garden
INSERT INTO gamedevs (name) VALUES ('MadSushi') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Alchemy Garden', (SELECT id FROM gamedevs WHERE name = 'MadSushi')) ON DUPLICATE KEY UPDATE name=name;

-- America's Army: Proving Grounds
INSERT INTO gamedevs (name) VALUES ('U.S. Army') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('America''s Army: Proving Grounds', (SELECT id FROM gamedevs WHERE name = 'U.S. Army')) ON DUPLICATE KEY UPDATE name=name;

-- Among Us
INSERT INTO gamedevs (name) VALUES ('Innersloth') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Among Us', (SELECT id FROM gamedevs WHERE name = 'Innersloth')) ON DUPLICATE KEY UPDATE name=name;

-- Apex Legends
INSERT INTO gamedevs (name) VALUES ('Respawn Entertainment') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Apex Legends', (SELECT id FROM gamedevs WHERE name = 'Respawn Entertainment')) ON DUPLICATE KEY UPDATE name=name;

-- Assetto Corsa
INSERT INTO gamedevs (name) VALUES ('Kunos Simulazioni') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Assetto Corsa', (SELECT id FROM gamedevs WHERE name = 'Kunos Simulazioni')) ON DUPLICATE KEY UPDATE name=name;

-- Battlefield 1 ™
INSERT INTO gamedevs (name) VALUES ('DICE') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Battlefield 1 ™', (SELECT id FROM gamedevs WHERE name = 'DICE')) ON DUPLICATE KEY UPDATE name=name;

-- Battlefield 4™
INSERT INTO gamedevs (name) VALUES ('DICE') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Battlefield 4™', (SELECT id FROM gamedevs WHERE name = 'DICE')) ON DUPLICATE KEY UPDATE name=name;

-- Battlefield: Bad Company™ 2
INSERT INTO gamedevs (name) VALUES ('DICE') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Battlefield: Bad Company™ 2', (SELECT id FROM gamedevs WHERE name = 'DICE')) ON DUPLICATE KEY UPDATE name=name;

-- Battlefield™ V
INSERT INTO gamedevs (name) VALUES ('DICE') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Battlefield™ V', (SELECT id FROM gamedevs WHERE name = 'DICE')) ON DUPLICATE KEY UPDATE name=name;

-- Battlefleet Gothic: Armada 2
INSERT INTO gamedevs (name) VALUES ('Tindalos Interactive') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Battlefleet Gothic: Armada 2', (SELECT id FROM gamedevs WHERE name = 'Tindalos Interactive')) ON DUPLICATE KEY UPDATE name=name;

-- Bayonetta
INSERT INTO gamedevs (name) VALUES ('PlatinumGames') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Bayonetta', (SELECT id FROM gamedevs WHERE name = 'PlatinumGames')) ON DUPLICATE KEY UPDATE name=name;

-- Beasts of Maravilla Island
INSERT INTO gamedevs (name) VALUES ('Banana Bird Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Beasts of Maravilla Island', (SELECT id FROM gamedevs WHERE name = 'Banana Bird Studios')) ON DUPLICATE KEY UPDATE name=name;

-- Beyond The Wire
INSERT INTO gamedevs (name) VALUES ('Redstone Interactive') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Beyond The Wire', (SELECT id FROM gamedevs WHERE name = 'Redstone Interactive')) ON DUPLICATE KEY UPDATE name=name;

-- BioShock
INSERT INTO gamedevs (name) VALUES ('2K Boston') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('BioShock', (SELECT id FROM gamedevs WHERE name = '2K Boston')) ON DUPLICATE KEY UPDATE name=name;

-- BioShock 2
INSERT INTO gamedevs (name) VALUES ('2K Marin') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('BioShock 2', (SELECT id FROM gamedevs WHERE name = '2K Marin')) ON DUPLICATE KEY UPDATE name=name;

-- BioShock 2 Remastered
INSERT INTO gamedevs (name) VALUES ('2K Marin') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('BioShock 2 Remastered', (SELECT id FROM gamedevs WHERE name = '2K Marin')) ON DUPLICATE KEY UPDATE name=name;

-- BioShock Infinite
INSERT INTO gamedevs (name) VALUES ('Irrational Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('BioShock Infinite', (SELECT id FROM gamedevs WHERE name = 'Irrational Games')) ON DUPLICATE KEY UPDATE name=name;

-- BioShock Remastered
INSERT INTO gamedevs (name) VALUES ('2K Boston') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('BioShock Remastered', (SELECT id FROM gamedevs WHERE name = '2K Boston')) ON DUPLICATE KEY UPDATE name=name;

-- Bitburner
INSERT INTO gamedevs (name) VALUES ('bitburner') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Bitburner', (SELECT id FROM gamedevs WHERE name = 'bitburner')) ON DUPLICATE KEY UPDATE name=name;

-- Black Desert
INSERT INTO gamedevs (name) VALUES ('Pearl Abyss') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Black Desert', (SELECT id FROM gamedevs WHERE name = 'Pearl Abyss')) ON DUPLICATE KEY UPDATE name=name;

-- Bloons TD 6
INSERT INTO gamedevs (name) VALUES ('Ninja Kiwi') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Bloons TD 6', (SELECT id FROM gamedevs WHERE name = 'Ninja Kiwi')) ON DUPLICATE KEY UPDATE name=name;

-- BONEWORKS
INSERT INTO gamedevs (name) VALUES ('Stress Level Zero') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('BONEWORKS', (SELECT id FROM gamedevs WHERE name = 'Stress Level Zero')) ON DUPLICATE KEY UPDATE name=name;

-- Borderlands 2
INSERT INTO gamedevs (name) VALUES ('Gearbox Software') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Borderlands 2', (SELECT id FROM gamedevs WHERE name = 'Gearbox Software')) ON DUPLICATE KEY UPDATE name=name;

-- Borderlands: The Pre-Sequel
INSERT INTO gamedevs (name) VALUES ('Gearbox Software') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Borderlands: The Pre-Sequel', (SELECT id FROM gamedevs WHERE name = 'Gearbox Software')) ON DUPLICATE KEY UPDATE name=name;

-- BPM: BULLETS PER MINUTE
INSERT INTO gamedevs (name) VALUES ('Awe Interactive') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('BPM: BULLETS PER MINUTE', (SELECT id FROM gamedevs WHERE name = 'Awe Interactive')) ON DUPLICATE KEY UPDATE name=name;

-- Burning Daylight
INSERT INTO gamedevs (name) VALUES ('Burning Daylight Devs') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Burning Daylight', (SELECT id FROM gamedevs WHERE name = 'Burning Daylight Devs')) ON DUPLICATE KEY UPDATE name=name;

-- Call of Duty®
INSERT INTO gamedevs (name) VALUES ('Infinity Ward') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Call of Duty®', (SELECT id FROM gamedevs WHERE name = 'Infinity Ward')) ON DUPLICATE KEY UPDATE name=name;

-- Counter-Strike 2
INSERT INTO gamedevs (name) VALUES ('Valve') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Counter-Strike 2', (SELECT id FROM gamedevs WHERE name = 'Valve')) ON DUPLICATE KEY UPDATE name=name;

-- Crucible
INSERT INTO gamedevs (name) VALUES ('Amazon Game Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Crucible', (SELECT id FROM gamedevs WHERE name = 'Amazon Game Studios')) ON DUPLICATE KEY UPDATE name=name;

-- Crysis® 3
INSERT INTO gamedevs (name) VALUES ('Crytek') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Crysis® 3', (SELECT id FROM gamedevs WHERE name = 'Crytek')) ON DUPLICATE KEY UPDATE name=name;

-- Cultivation Story: Reincarnation
INSERT INTO gamedevs (name) VALUES ('Nguyên Quang Minh') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Cultivation Story: Reincarnation', (SELECT id FROM gamedevs WHERE name = 'Nguyên Quang Minh')) ON DUPLICATE KEY UPDATE name=name;

-- Cyberpunk 2077
INSERT INTO gamedevs (name) VALUES ('CD Projekt Red') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Cyberpunk 2077', (SELECT id FROM gamedevs WHERE name = 'CD Projekt Red')) ON DUPLICATE KEY UPDATE name=name;

-- Darkest Dungeon®
INSERT INTO gamedevs (name) VALUES ('Red Hook Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Darkest Dungeon®', (SELECT id FROM gamedevs WHERE name = 'Red Hook Studios')) ON DUPLICATE KEY UPDATE name=name;

-- Darksiders
INSERT INTO gamedevs (name) VALUES ('Vigil Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Darksiders', (SELECT id FROM gamedevs WHERE name = 'Vigil Games')) ON DUPLICATE KEY UPDATE name=name;

-- Darksiders Genesis
INSERT INTO gamedevs (name) VALUES ('Airship Syndicate') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Darksiders Genesis', (SELECT id FROM gamedevs WHERE name = 'Airship Syndicate')) ON DUPLICATE KEY UPDATE name=name;

-- Darksiders II Deathinitive Edition
INSERT INTO gamedevs (name) VALUES ('Gunfire Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Darksiders II Deathinitive Edition', (SELECT id FROM gamedevs WHERE name = 'Gunfire Games')) ON DUPLICATE KEY UPDATE name=name;

-- Darksiders III
INSERT INTO gamedevs (name) VALUES ('Gunfire Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Darksiders III', (SELECT id FROM gamedevs WHERE name = 'Gunfire Games')) ON DUPLICATE KEY UPDATE name=name;

-- Darksiders Warmastered Edition
INSERT INTO gamedevs (name) VALUES ('KAIKO') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Darksiders Warmastered Edition', (SELECT id FROM gamedevs WHERE name = 'KAIKO')) ON DUPLICATE KEY UPDATE name=name;

-- Dead by Daylight
INSERT INTO gamedevs (name) VALUES ('Behaviour Interactive') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Dead by Daylight', (SELECT id FROM gamedevs WHERE name = 'Behaviour Interactive')) ON DUPLICATE KEY UPDATE name=name;

-- Dead Cells
INSERT INTO gamedevs (name) VALUES ('Motion Twin') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Dead Cells', (SELECT id FROM gamedevs WHERE name = 'Motion Twin')) ON DUPLICATE KEY UPDATE name=name;

-- Dead Space (2008)
INSERT INTO gamedevs (name) VALUES ('EA Redwood Shores') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Dead Space (2008)', (SELECT id FROM gamedevs WHERE name = "EA Redwood Shores")) ON DUPLICATE KEY UPDATE name=name;

-- Dead Space 2
INSERT INTO gamedevs (name) VALUES ('Visceral Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Dead Space 2', (SELECT id FROM gamedevs WHERE name = 'Visceral Games')) ON DUPLICATE KEY UPDATE name=name;

-- Dead Space™ 3
INSERT INTO gamedevs (name) VALUES ('Visceral Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Dead Space™ 3', (SELECT id FROM gamedevs WHERE name = 'Visceral Games')) ON DUPLICATE KEY UPDATE name=name;

-- Deceit
INSERT INTO gamedevs (name) VALUES ('Automaton') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Deceit', (SELECT id FROM gamedevs WHERE name = 'Automaton')) ON DUPLICATE KEY UPDATE name=name;

-- Deep Rock Galactic
INSERT INTO gamedevs (name) VALUES ('Ghost Ship Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Deep Rock Galactic', (SELECT id FROM gamedevs WHERE name = 'Ghost Ship Games')) ON DUPLICATE KEY UPDATE name=name;

-- Destiny 2
INSERT INTO gamedevs (name) VALUES ('Bungie') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Destiny 2', (SELECT id FROM gamedevs WHERE name = 'Bungie')) ON DUPLICATE KEY UPDATE name=name;

-- Devil May Cry 5
INSERT INTO gamedevs (name) VALUES ('Capcom') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Devil May Cry 5', (SELECT id FROM gamedevs WHERE name = 'Capcom')) ON DUPLICATE KEY UPDATE name=name;

-- Don't Crash - The Political Game
INSERT INTO gamedevs (name) VALUES ('Spooky Planet Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Don''t Crash - The Political Game', (SELECT id FROM gamedevs WHERE name = 'Spooky Planet Studios')) ON DUPLICATE KEY UPDATE name=name;

-- DOOM
INSERT INTO gamedevs (name) VALUES ('id Software') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('DOOM', (SELECT id FROM gamedevs WHERE name = 'id Software')) ON DUPLICATE KEY UPDATE name=name;

-- Dota 2
INSERT INTO gamedevs (name) VALUES ('Valve') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Dota 2', (SELECT id FROM gamedevs WHERE name = 'Valve')) ON DUPLICATE KEY UPDATE name=name;

-- DRAGON BALL XENOVERSE 2
INSERT INTO gamedevs (name) VALUES ('DIMPS') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('DRAGON BALL XENOVERSE 2', (SELECT id FROM gamedevs WHERE name = 'DIMPS')) ON DUPLICATE KEY UPDATE name=name;

-- Dragon's Dogma: Dark Arisen
INSERT INTO gamedevs (name) VALUES ('Capcom') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Dragon''s Dogma: Dark Arisen', (SELECT id FROM gamedevs WHERE name = 'Capcom')) ON DUPLICATE KEY UPDATE name=name;

-- Drawful 2
INSERT INTO gamedevs (name) VALUES ('Jackbox Games, Inc.') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Drawful 2', (SELECT id FROM gamedevs WHERE name = 'Jackbox Games, Inc.')) ON DUPLICATE KEY UPDATE name=name;

-- Dread X Collection
INSERT INTO gamedevs (name) VALUES ('Dread XP') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Dread X Collection', (SELECT id FROM gamedevs WHERE name = 'Dread XP')) ON DUPLICATE KEY UPDATE name=name;

-- Dread X Collection 2
INSERT INTO gamedevs (name) VALUES ('Dread XP') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Dread X Collection 2', (SELECT id FROM gamedevs WHERE name = 'Dread XP')) ON DUPLICATE KEY UPDATE name=name;

-- Dread X Collection 3
INSERT INTO gamedevs (name) VALUES ('Dread XP') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Dread X Collection 3', (SELECT id FROM gamedevs WHERE name = 'Dread XP')) ON DUPLICATE KEY UPDATE name=name;

-- ELDEN RING
INSERT INTO gamedevs (name) VALUES ('FromSoftware') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('ELDEN RING', (SELECT id FROM gamedevs WHERE name = 'FromSoftware')) ON DUPLICATE KEY UPDATE name=name;

-- Eternal Return
INSERT INTO gamedevs (name) VALUES ('Nimble Neuron') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Eternal Return', (SELECT id FROM gamedevs WHERE name = 'Nimble Neuron')) ON DUPLICATE KEY UPDATE name=name;

-- EVE Online
INSERT INTO gamedevs (name) VALUES ('CCP Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('EVE Online', (SELECT id FROM gamedevs WHERE name = 'CCP Games')) ON DUPLICATE KEY UPDATE name=name;

-- Explore Fushimi Inari
INSERT INTO gamedevs (name) VALUES ('SakeVisual') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Explore Fushimi Inari', (SELECT id FROM gamedevs WHERE name = 'SakeVisual')) ON DUPLICATE KEY UPDATE name=name;

-- Fallout 76
INSERT INTO gamedevs (name) VALUES ('Bethesda Game Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Fallout 76', (SELECT id FROM gamedevs WHERE name = 'Bethesda Game Studios')) ON DUPLICATE KEY UPDATE name=name;

-- Fallout: New Vegas
INSERT INTO gamedevs (name) VALUES ('Obsidian Entertainment') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Fallout: New Vegas', (SELECT id FROM gamedevs WHERE name = 'Obsidian Entertainment')) ON DUPLICATE KEY UPDATE name=name;

-- Far Cry 5
INSERT INTO gamedevs (name) VALUES ('Ubisoft') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Far Cry 5', (SELECT id FROM gamedevs WHERE name = 'Ubisoft')) ON DUPLICATE KEY UPDATE name=name;

-- Far Cry New Dawn
INSERT INTO gamedevs (name) VALUES ('Ubisoft') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Far Cry New Dawn', (SELECT id FROM gamedevs WHERE name = 'Ubisoft')) ON DUPLICATE KEY UPDATE name=name;

-- Far Cry Primal
INSERT INTO gamedevs (name) VALUES ('Ubisoft') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Far Cry Primal', (SELECT id FROM gamedevs WHERE name = 'Ubisoft')) ON DUPLICATE KEY UPDATE name=name;

-- Forza Horizon 5
INSERT INTO gamedevs (name) VALUES ('Playground Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Forza Horizon 5', (SELECT id FROM gamedevs WHERE name = 'Playground Games')) ON DUPLICATE KEY UPDATE name=name;

-- FrostRunner
INSERT INTO gamedevs (name) VALUES ('Think Arcade') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('FrostRunner', (SELECT id FROM gamedevs WHERE name = 'Think Arcade')) ON DUPLICATE KEY UPDATE name=name;

-- Garfield Kart
INSERT INTO gamedevs (name) VALUES ('Artefacts Studio') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Garfield Kart', (SELECT id FROM gamedevs WHERE name = 'Artefacts Studio')) ON DUPLICATE KEY UPDATE name=name;

-- Garfield Kart - Furious Racing
INSERT INTO gamedevs (name) VALUES ('Artefacts Studio') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Garfield Kart - Furious Racing', (SELECT id FROM gamedevs WHERE name = 'Artefacts Studio')) ON DUPLICATE KEY UPDATE name=name;

-- Ghostrunner
INSERT INTO gamedevs (name) VALUES ('One More Level') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Ghostrunner', (SELECT id FROM gamedevs WHERE name = 'One More Level')) ON DUPLICATE KEY UPDATE name=name;

-- Gravitas
INSERT INTO gamedevs (name) VALUES ('GimmeBreakGames') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Gravitas', (SELECT id FROM gamedevs WHERE name = 'GimmeBreakGames')) ON DUPLICATE KEY UPDATE name=name;

-- GreedFall
INSERT INTO gamedevs (name) VALUES ('Spiders') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('GreedFall', (SELECT id FROM gamedevs WHERE name = 'Spiders')) ON DUPLICATE KEY UPDATE name=name;

-- Grounded
INSERT INTO gamedevs (name) VALUES ('Obsidian Entertainment') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Grounded', (SELECT id FROM gamedevs WHERE name = 'Obsidian Entertainment')) ON DUPLICATE KEY UPDATE name=name;

-- GTFO
INSERT INTO gamedevs (name) VALUES ('10 Chambers Collective') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('GTFO', (SELECT id FROM gamedevs WHERE name = '10 Chambers Collective')) ON DUPLICATE KEY UPDATE name=name;

-- Guild Wars 2
INSERT INTO gamedevs (name) VALUES ('ArenaNet') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Guild Wars 2', (SELECT id FROM gamedevs WHERE name = 'ArenaNet')) ON DUPLICATE KEY UPDATE name=name;

-- GUILTY GEAR -STRIVE-
INSERT INTO gamedevs (name) VALUES ('Arc System Works') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('GUILTY GEAR -STRIVE-', (SELECT id FROM gamedevs WHERE name = 'Arc System Works')) ON DUPLICATE KEY UPDATE name=name;

-- GUNDAM EVOLUTION
INSERT INTO gamedevs (name) VALUES ('Bandai Namco') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('GUNDAM EVOLUTION', (SELECT id FROM gamedevs WHERE name = 'Bandai Namco')) ON DUPLICATE KEY UPDATE name=name;

-- Gunfire Reborn
INSERT INTO gamedevs (name) VALUES ('Duoyi Interactive Entertainment Limited') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Gunfire Reborn', (SELECT id FROM gamedevs WHERE name = 'Duoyi Interactive Entertainment Limited')) ON DUPLICATE KEY UPDATE name=name;

-- Hades
INSERT INTO gamedevs (name) VALUES ('Supergiant Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Hades', (SELECT id FROM gamedevs WHERE name = 'Supergiant Games')) ON DUPLICATE KEY UPDATE name=name;

-- Halo Infinite
INSERT INTO gamedevs (name) VALUES ('343 Industries') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Halo Infinite', (SELECT id FROM gamedevs WHERE name = '343 Industries')) ON DUPLICATE KEY UPDATE name=name;

-- Halo: The Master Chief Collection
INSERT INTO gamedevs (name) VALUES ('343 Industries') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Halo: The Master Chief Collection', (SELECT id FROM gamedevs WHERE name = '343 Industries')) ON DUPLICATE KEY UPDATE name=name;

-- HAWKED
INSERT INTO gamedevs (name) VALUES ('Forever Entertainment S. A.') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('HAWKED', (SELECT id FROM gamedevs WHERE name = 'Forever Entertainment S. A.')) ON DUPLICATE KEY UPDATE name=name;

-- Helltaker
INSERT INTO gamedevs (name) VALUES ('Łukasz Piskorz (vanripper)') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Helltaker', (SELECT id FROM gamedevs WHERE name = 'Łukasz Piskorz (vanripper)')) ON DUPLICATE KEY UPDATE name=name;

-- Hextech Mayhem: A League of Legends Story™
INSERT INTO gamedevs (name) VALUES ('Riot Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Hextech Mayhem: A League of Legends Story™', (SELECT id FROM gamedevs WHERE name = 'Riot Games')) ON DUPLICATE KEY UPDATE name=name;

-- HighFleet
INSERT INTO gamedevs (name) VALUES ('MicroProse Software') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('HighFleet', (SELECT id FROM gamedevs WHERE name = 'MicroProse Software')) ON DUPLICATE KEY UPDATE name=name;

-- Hogwarts Legacy
INSERT INTO gamedevs (name) VALUES ('Portkey Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Hogwarts Legacy', (SELECT id FROM gamedevs WHERE name = 'Portkey Games')) ON DUPLICATE KEY UPDATE name=name;

-- Hollow Knight
INSERT INTO gamedevs (name) VALUES ('Team Cherry') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Hollow Knight', (SELECT id FROM gamedevs WHERE name = 'Team Cherry')) ON DUPLICATE KEY UPDATE name=name;

-- Hue
INSERT INTO gamedevs (name) VALUES ('Fiddlesticks Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Hue', (SELECT id FROM gamedevs WHERE name = 'Fiddlesticks Games')) ON DUPLICATE KEY UPDATE name=name;

-- Hunt: Showdown
INSERT INTO gamedevs (name) VALUES ('Crytek') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Hunt: Showdown', (SELECT id FROM gamedevs WHERE name = 'Crytek')) ON DUPLICATE KEY UPDATE name=name;

-- I Love You, Colonel Sanders! A Finger Lickin’ Good Dating Simulator
INSERT INTO gamedevs (name) VALUES ('Psyop') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('I Love You, Colonel Sanders! A Finger Lickin’ Good Dating Simulator', (SELECT id FROM gamedevs WHERE name = 'Psyop')) ON DUPLICATE KEY UPDATE name=name;

-- Idol Showdown
INSERT INTO gamedevs (name) VALUES ('Idol Showdown') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Idol Showdown', (SELECT id FROM gamedevs WHERE name = 'Idol Showdown')) ON DUPLICATE KEY UPDATE name=name;

-- Injustice: Gods Among Us Ultimate Edition
INSERT INTO gamedevs (name) VALUES ('NetherRealm Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Injustice: Gods Among Us Ultimate Edition', (SELECT id FROM gamedevs WHERE name = 'NetherRealm Studios')) ON DUPLICATE KEY UPDATE name=name;

-- Ironsight
INSERT INTO gamedevs (name) VALUES ('Wiple Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Ironsight', (SELECT id FROM gamedevs WHERE name = 'Wiple Games')) ON DUPLICATE KEY UPDATE name=name;

-- It Takes Two
INSERT INTO gamedevs (name) VALUES ('Hazelight Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('It Takes Two', (SELECT id FROM gamedevs WHERE name = 'Hazelight Studios')) ON DUPLICATE KEY UPDATE name=name;

-- JUMP FORCE
INSERT INTO gamedevs (name) VALUES ('Spike Chunsoft') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('JUMP FORCE', (SELECT id FROM gamedevs WHERE name = 'Spike Chunsoft')) ON DUPLICATE KEY UPDATE name=name;

-- Kainga
INSERT INTO gamedevs (name) VALUES ('Steve Salmond') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Kainga', (SELECT id FROM gamedevs WHERE name = 'Steve Salmond')) ON DUPLICATE KEY UPDATE name=name;

-- KHOLAT
INSERT INTO gamedevs (name) VALUES ('IMGN.PRO') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('KHOLAT', (SELECT id FROM gamedevs WHERE name = 'IMGN.PRO')) ON DUPLICATE KEY UPDATE name=name;

-- KovaaK's
INSERT INTO gamedevs (name) VALUES ('Reakktor Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('KovaaK''s', (SELECT id FROM gamedevs WHERE name = 'Reakktor Studios')) ON DUPLICATE KEY UPDATE name=name;

-- Learn Game Development, Unity Code Monkey
INSERT INTO gamedevs (name) VALUES ('Unity Technologies') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Learn Game Development, Unity Code Monkey', (SELECT id FROM gamedevs WHERE name = 'Unity Technologies')) ON DUPLICATE KEY UPDATE name=name;

-- Left 4 Dead 2
INSERT INTO gamedevs (name) VALUES ('Valve') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Left 4 Dead 2', (SELECT id FROM gamedevs WHERE name = 'Valve')) ON DUPLICATE KEY UPDATE name=name;

-- LEGO® Star Wars™ III: The Clone Wars™
INSERT INTO gamedevs (name) VALUES ('Traveller''s Tales') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('LEGO® Star Wars™ III: The Clone Wars™', (SELECT id FROM gamedevs WHERE name = 'Traveller''s Tales')) ON DUPLICATE KEY UPDATE name=name;

-- LEGO® Star Wars™: The Complete Saga
INSERT INTO games (name, developer_id) VALUES ('LEGO® Star Wars™: The Complete Saga', (SELECT id FROM gamedevs WHERE name = 'Traveller''s Tales')) ON DUPLICATE KEY UPDATE name=name;

-- LEGO® Star Wars™: The Complete Saga
INSERT INTO games (name, developer_id) VALUES ('LEGO® Star Wars™: The Complete Saga', (SELECT id FROM gamedevs WHERE name = 'Traveller''s Tales')) ON DUPLICATE KEY UPDATE name=name;

-- LEGO® The Hobbit™
INSERT INTO games (name, developer_id) VALUES ('LEGO® The Hobbit™', (SELECT id FROM gamedevs WHERE name = 'Traveller''s Tales')) ON DUPLICATE KEY UPDATE name=name;

-- LEGO® The Lord of the Rings™
INSERT INTO games (name, developer_id) VALUES ('LEGO® The Lord of the Rings™', (SELECT id FROM gamedevs WHERE name = 'Traveller''s Tales')) ON DUPLICATE KEY UPDATE name=name;

-- Lost Ark
INSERT INTO gamedevs (name) VALUES ('Smilegate') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Lost Ark', (SELECT id FROM gamedevs WHERE name = 'Smilegate')) ON DUPLICATE KEY UPDATE name=name;

-- Lost Lands: Mahjong
INSERT INTO gamedevs (name) VALUES ('FIVE-BN STUDIO') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Lost Lands: Mahjong', (SELECT id FROM gamedevs WHERE name = 'FIVE-BN STUDIO')) ON DUPLICATE KEY UPDATE name=name;

-- Low Light Combat
INSERT INTO gamedevs (name) VALUES ('PoL BoY') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Low Light Combat', (SELECT id FROM gamedevs WHERE name = 'PoL BoY')) ON DUPLICATE KEY UPDATE name=name;

-- Marvel's Avengers - The Definitive Edition
INSERT INTO gamedevs (name) VALUES ('Crystal Dynamics') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Marvel''s Avengers - The Definitive Edition', (SELECT id FROM gamedevs WHERE name = 'Crystal Dynamics')) ON DUPLICATE KEY UPDATE name=name;

-- Melvor Idle
INSERT INTO gamedevs (name) VALUES ('Malcs (Melvor Idle)') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Melvor Idle', (SELECT id FROM gamedevs WHERE name = 'Malcs (Melvor Idle)')) ON DUPLICATE KEY UPDATE name=name;

-- Metro 2033
INSERT INTO gamedevs (name) VALUES ('4A Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Metro 2033', (SELECT id FROM gamedevs WHERE name = '4A Games')) ON DUPLICATE KEY UPDATE name=name;

-- Middle-earth™: Shadow of Mordor™
INSERT INTO gamedevs (name) VALUES ('Monolith Productions') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Middle-earth™: Shadow of Mordor™', (SELECT id FROM gamedevs WHERE name = 'Monolith Productions')) ON DUPLICATE KEY UPDATE name=name;

-- Middle-earth™: Shadow of War™
INSERT INTO gamedevs (name) VALUES ('Monolith Productions') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Middle-earth™: Shadow of War™', (SELECT id FROM gamedevs WHERE name = 'Monolith Productions')) ON DUPLICATE KEY UPDATE name=name;

-- Mirror's Edge
INSERT INTO gamedevs (name) VALUES ('DICE') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Mirror''s Edge', (SELECT id FROM gamedevs WHERE name = 'DICE')) ON DUPLICATE KEY UPDATE name=name;

-- Mirror's Edge™ Catalyst
INSERT INTO gamedevs (name) VALUES ('DICE') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Mirror''s Edge™ Catalyst', (SELECT id FROM gamedevs WHERE name = 'DICE')) ON DUPLICATE KEY UPDATE name=name;

-- MOBILE SUIT GUNDAM BATTLE OPERATION 2
INSERT INTO gamedevs (name) VALUES ('B.B. Studio') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('MOBILE SUIT GUNDAM BATTLE OPERATION 2', (SELECT id FROM gamedevs WHERE name = 'B.B. Studio')) ON DUPLICATE KEY UPDATE name=name;

-- MONSTER HUNTER RISE
INSERT INTO gamedevs (name) VALUES ('CAPCOM') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('MONSTER HUNTER RISE', (SELECT id FROM gamedevs WHERE name = 'CAPCOM')) ON DUPLICATE KEY UPDATE name=name;

-- Monster Hunter: World
INSERT INTO gamedevs (name) VALUES ('CAPCOM') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Monster Hunter: World', (SELECT id FROM gamedevs WHERE name = 'CAPCOM')) ON DUPLICATE KEY UPDATE name=name;

-- Muck
INSERT INTO gamedevs (name) VALUES ('Dani') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Muck', (SELECT id FROM gamedevs WHERE name = 'Dani')) ON DUPLICATE KEY UPDATE name=name;

-- MultiVersus
INSERT INTO gamedevs (name) VALUES ('WB Games Montréal') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('MultiVersus', (SELECT id FROM gamedevs WHERE name = 'WB Games Montréal')) ON DUPLICATE KEY UPDATE name=name;

-- MY HERO ULTRA RUMBLE
INSERT INTO gamedevs (name) VALUES ('Bandai Namco Entertainment') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('MY HERO ULTRA RUMBLE', (SELECT id FROM gamedevs WHERE name = 'Bandai Namco Entertainment')) ON DUPLICATE KEY UPDATE name=name;

-- NARAKA: BLADEPOINT
INSERT INTO gamedevs (name) VALUES ('24 Entertainment') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('NARAKA: BLADEPOINT', (SELECT id FROM gamedevs WHERE name = '24 Entertainment')) ON DUPLICATE KEY UPDATE name=name;

-- National Park Girls
INSERT INTO gamedevs (name) VALUES ('Sekai Project') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('National Park Girls', (SELECT id FROM gamedevs WHERE name = 'Sekai Project')) ON DUPLICATE KEY UPDATE name=name;

-- Necromunda: Hired Gun
INSERT INTO gamedevs (name) VALUES ('Streum On Studio') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Necromunda: Hired Gun', (SELECT id FROM gamedevs WHERE name = 'Streum On Studio')) ON DUPLICATE KEY UPDATE name=name;

-- NEKOPARA Vol. 1
INSERT INTO gamedevs (name) VALUES ('NEKO WORKs') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('NEKOPARA Vol. 1', (SELECT id FROM gamedevs WHERE name = 'NEKO WORKs')) ON DUPLICATE KEY UPDATE name=name;

-- Neon Abyss
INSERT INTO gamedevs (name) VALUES ('Veewo Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Neon Abyss', (SELECT id FROM gamedevs WHERE name = 'Veewo Games')) ON DUPLICATE KEY UPDATE name=name;

-- Neon Boost
INSERT INTO gamedevs (name) VALUES ('Bunnyhug') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Neon Boost', (SELECT id FROM gamedevs WHERE name = 'Bunnyhug')) ON DUPLICATE KEY UPDATE name=name;

-- New World
INSERT INTO gamedevs (name) VALUES ('Amazon Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('New World', (SELECT id FROM gamedevs WHERE name = 'Amazon Games')) ON DUPLICATE KEY UPDATE name=name;

-- Noita
INSERT INTO gamedevs (name) VALUES ('Nolla Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Noita', (SELECT id FROM gamedevs WHERE name = 'Nolla Games')) ON DUPLICATE KEY UPDATE name=name;

-- Ori and the Blind Forest: Definitive Edition
INSERT INTO gamedevs (name) VALUES ('Moon Studios GmbH') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Ori and the Blind Forest: Definitive Edition', (SELECT id FROM gamedevs WHERE name = 'Moon Studios GmbH')) ON DUPLICATE KEY UPDATE name=name;

-- Ori and the Will of the Wisps
INSERT INTO games (name, developer_id) VALUES ('Ori and the Will of the Wisps', (SELECT id FROM gamedevs WHERE name = 'Moon Studios GmbH')) ON DUPLICATE KEY UPDATE name=name;

-- Paladins
INSERT INTO gamedevs (name) VALUES ('Hi-Rez Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Paladins', (SELECT id FROM gamedevs WHERE name = 'Hi-Rez Studios')) ON DUPLICATE KEY UPDATE name=name;

-- PAYDAY 2
INSERT INTO gamedevs (name) VALUES ('OVERKILL - a Starbreeze Studio.') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('PAYDAY 2', (SELECT id FROM gamedevs WHERE name = 'OVERKILL - a Starbreeze Studio.')) ON DUPLICATE KEY UPDATE name=name;

-- Phasmophobia
INSERT INTO gamedevs (name) VALUES ('Kinetic Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Phasmophobia', (SELECT id FROM gamedevs WHERE name = 'Kinetic Games')) ON DUPLICATE KEY UPDATE name=name;

-- pla_toon
INSERT INTO gamedevs (name) VALUES ('JoyBits Ltd.') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('pla_toon', (SELECT id FROM gamedevs WHERE name = 'JoyBits Ltd.')) ON DUPLICATE KEY UPDATE name=name;

-- PlanetSide 2
INSERT INTO gamedevs (name) VALUES ('Rogue Planet Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('PlanetSide 2', (SELECT id FROM gamedevs WHERE name = 'Rogue Planet Games')) ON DUPLICATE KEY UPDATE name=name;

-- Predecessor
INSERT INTO gamedevs (name) VALUES ('Omniverse Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Predecessor', (SELECT id FROM gamedevs WHERE name = 'Omniverse Games')) ON DUPLICATE KEY UPDATE name=name;

-- Prey
INSERT INTO gamedevs (name) VALUES ('Arkane Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Prey', (SELECT id FROM gamedevs WHERE name = 'Arkane Studios')) ON DUPLICATE KEY UPDATE name=name;

-- PUBG: BATTLEGROUNDS
INSERT INTO gamedevs (name) VALUES ('PUBG Corporation') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('PUBG: BATTLEGROUNDS', (SELECT id FROM gamedevs WHERE name = 'PUBG Corporation')) ON DUPLICATE KEY UPDATE name=name;

-- Pyre
INSERT INTO gamedevs (name) VALUES ('Supergiant Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Pyre', (SELECT id FROM gamedevs WHERE name = 'Supergiant Games')) ON DUPLICATE KEY UPDATE name=name;

-- Quake Champions
INSERT INTO gamedevs (name) VALUES ('id Software') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Quake Champions', (SELECT id FROM gamedevs WHERE name = 'id Software')) ON DUPLICATE KEY UPDATE name=name;

-- Quake II
INSERT INTO games (name, developer_id) VALUES ('Quake II', (SELECT id FROM gamedevs WHERE name = 'id Software')) ON DUPLICATE KEY UPDATE name=name;

-- Quake II RTX
INSERT INTO games (name, developer_id) VALUES ('Quake II RTX', (SELECT id FROM gamedevs WHERE name = 'id Software')) ON DUPLICATE KEY UPDATE name=name;

-- Rainbowcore Hypernova
INSERT INTO gamedevs (name) VALUES ('A Trillion Dollar Game Studio') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Rainbowcore Hypernova', (SELECT id FROM gamedevs WHERE name = 'A Trillion Dollar Game Studio')) ON DUPLICATE KEY UPDATE name=name;

-- Realm Royale Reforged
INSERT INTO gamedevs (name) VALUES ('Hi-Rez Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Realm Royale Reforged', (SELECT id FROM gamedevs WHERE name = 'Hi-Rez Studios')) ON DUPLICATE KEY UPDATE name=name;

-- Red Dead Redemption 2
INSERT INTO gamedevs (name) VALUES ('Rockstar Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Red Dead Redemption 2', (SELECT id FROM gamedevs WHERE name = 'Rockstar Games')) ON DUPLICATE KEY UPDATE name=name;

-- Risk of Rain 2
INSERT INTO gamedevs (name) VALUES ('Hopoo Games, LLC') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Risk of Rain 2', (SELECT id FROM gamedevs WHERE name = 'Hopoo Games, LLC')) ON DUPLICATE KEY UPDATE name=name;

-- RuneScape
INSERT INTO gamedevs (name) VALUES ('Jagex Limited') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('RuneScape', (SELECT id FROM gamedevs WHERE name = 'Jagex Limited')) ON DUPLICATE KEY UPDATE name=name;

-- Ryse: Son of Rome
INSERT INTO gamedevs (name) VALUES ('Crytek') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Ryse: Son of Rome', (SELECT id FROM gamedevs WHERE name = 'Crytek')) ON DUPLICATE KEY UPDATE name=name;

-- Secret World Legends
INSERT INTO gamedevs (name) VALUES ('Funcom Oslo AS') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Secret World Legends', (SELECT id FROM gamedevs WHERE name = 'Funcom Oslo AS')) ON DUPLICATE KEY UPDATE name=name;

-- Skul: The Hero Slayer
INSERT INTO gamedevs (name) VALUES ('SouthPAW Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Skul: The Hero Slayer', (SELECT id FROM gamedevs WHERE name = 'SouthPAW Games')) ON DUPLICATE KEY UPDATE name=name;

-- Skyforge
INSERT INTO gamedevs (name) VALUES ('Allods Team') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Skyforge', (SELECT id FROM gamedevs WHERE name = 'Allods Team')) ON DUPLICATE KEY UPDATE name=name;

-- SMITE
INSERT INTO gamedevs (name) VALUES ('Titan Forge Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('SMITE', (SELECT id FROM gamedevs WHERE name = 'Titan Forge Games')) ON DUPLICATE KEY UPDATE name=name;

-- SOULCALIBUR VI
INSERT INTO gamedevs (name) VALUES ('BANDAI NAMCO Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('SOULCALIBUR VI', (SELECT id FROM gamedevs WHERE name = 'BANDAI NAMCO Studios')) ON DUPLICATE KEY UPDATE name=name;

-- Space Hulk: Deathwing
INSERT INTO gamedevs (name) VALUES ('Streum On Studio') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Space Hulk: Deathwing', (SELECT id FROM gamedevs WHERE name = 'Streum On Studio')) ON DUPLICATE KEY UPDATE name=name;

-- Splitgate
INSERT INTO gamedevs (name) VALUES ('1047 Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Splitgate', (SELECT id FROM gamedevs WHERE name = '1047 Games')) ON DUPLICATE KEY UPDATE name=name;

-- STAR WARS™ Battlefront™
INSERT INTO gamedevs (name) VALUES ('DICE') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('STAR WARS™ Battlefront™', (SELECT id FROM gamedevs WHERE name = 'DICE')) ON DUPLICATE KEY UPDATE name=name;

-- STAR WARS™ Battlefront™ II
INSERT INTO gamedevs (name) VALUES ('DICE') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('STAR WARS™ Battlefront™ II', (SELECT id FROM gamedevs WHERE name = 'DICE')) ON DUPLICATE KEY UPDATE name=name;

-- STAR WARS™: The Old Republic™
INSERT INTO gamedevs (name) VALUES ('BioWare') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('STAR WARS™: The Old Republic™', (SELECT id FROM gamedevs WHERE name = 'BioWare')) ON DUPLICATE KEY UPDATE name=name;

-- Starship Troopers: Terran Command
INSERT INTO gamedevs (name) VALUES ('The Aristocrats') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Starship Troopers: Terran Command', (SELECT id FROM gamedevs WHERE name = 'The Aristocrats')) ON DUPLICATE KEY UPDATE name=name;

-- Steelrising
INSERT INTO gamedevs (name) VALUES ('Spiders') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Steelrising', (SELECT id FROM gamedevs WHERE name = 'Spiders')) ON DUPLICATE KEY UPDATE name=name;

-- STRAFE: Gold Edition
INSERT INTO gamedevs (name) VALUES ('Pixel Titans') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('STRAFE: Gold Edition', (SELECT id FROM gamedevs WHERE name = 'Pixel Titans')) ON DUPLICATE KEY UPDATE name=name;

-- Subnautica
INSERT INTO gamedevs (name) VALUES ('Unknown Worlds Entertainment') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Subnautica', (SELECT id FROM gamedevs WHERE name = 'Unknown Worlds Entertainment')) ON DUPLICATE KEY UPDATE name=name;

-- Super Mecha Champions
INSERT INTO gamedevs (name) VALUES ('NetEase Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Super Mecha Champions', (SELECT id FROM gamedevs WHERE name = 'NetEase Games')) ON DUPLICATE KEY UPDATE name=name;

-- Tabletop Simulator
INSERT INTO gamedevs (name) VALUES ('Berserk Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Tabletop Simulator', (SELECT id FROM gamedevs WHERE name = 'Berserk Games')) ON DUPLICATE KEY UPDATE name=name;

-- Team Fortress 2
INSERT INTO gamedevs (name) VALUES ('Valve') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Team Fortress 2', (SELECT id FROM gamedevs WHERE name = 'Valve')) ON DUPLICATE KEY UPDATE name=name;

-- TEKKEN 7
INSERT INTO gamedevs (name) VALUES ('BANDAI NAMCO Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('TEKKEN 7', (SELECT id FROM gamedevs WHERE name = 'BANDAI NAMCO Studios')) ON DUPLICATE KEY UPDATE name=name;

-- Terraria
INSERT INTO gamedevs (name) VALUES ('Re-Logic') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Terraria', (SELECT id FROM gamedevs WHERE name = 'Re-Logic')) ON DUPLICATE KEY UPDATE name=name;

-- The Cycle: Frontier
INSERT INTO gamedevs (name) VALUES ('YAGER Development') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('The Cycle: Frontier', (SELECT id FROM gamedevs WHERE name = 'YAGER Development')) ON DUPLICATE KEY UPDATE name=name;

-- The Elder Scrolls II: Daggerfall
INSERT INTO gamedevs (name) VALUES ('Bethesda Game Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('The Elder Scrolls II: Daggerfall', (SELECT id FROM gamedevs WHERE name = 'Bethesda Game Studios')) ON DUPLICATE KEY UPDATE name=name;

-- The Elder Scrolls III: Morrowind
INSERT INTO gamedevs (name) VALUES ('Bethesda Game Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('The Elder Scrolls III: Morrowind', (SELECT id FROM gamedevs WHERE name = 'Bethesda Game Studios')) ON DUPLICATE KEY UPDATE name=name;

-- The Elder Scrolls IV: Oblivion
INSERT INTO gamedevs (name) VALUES ('Bethesda Game Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('The Elder Scrolls IV: Oblivion', (SELECT id FROM gamedevs WHERE name = 'Bethesda Game Studios')) ON DUPLICATE KEY UPDATE name=name;

-- The Elder Scrolls Online
INSERT INTO gamedevs (name) VALUES ('Zenimax Online Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('The Elder Scrolls Online', (SELECT id FROM gamedevs WHERE name = 'Zenimax Online Studios')) ON DUPLICATE KEY UPDATE name=name;

-- The Elder Scrolls V: Skyrim Special Edition
INSERT INTO gamedevs (name) VALUES ('Bethesda Game Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('The Elder Scrolls V: Skyrim Special Edition', (SELECT id FROM gamedevs WHERE name = 'Bethesda Game Studios')) ON DUPLICATE KEY UPDATE name=name;

-- The Elder Scrolls: Arena
INSERT INTO gamedevs (name) VALUES ('Bethesda Game Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('The Elder Scrolls: Arena', (SELECT id FROM gamedevs WHERE name = 'Bethesda Game Studios')) ON DUPLICATE KEY UPDATE name=name;

-- THE FINALS
INSERT INTO gamedevs (name) VALUES ('Brain&Brain') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('THE FINALS', (SELECT id FROM gamedevs WHERE name = 'Brain&Brain')) ON DUPLICATE KEY UPDATE name=name;

-- THE GREAT GEOMETRIC MULTIVERSE TOUR
INSERT INTO gamedevs (name) VALUES ('Illuminated Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('THE GREAT GEOMETRIC MULTIVERSE TOUR', (SELECT id FROM gamedevs WHERE name = 'Illuminated Games')) ON DUPLICATE KEY UPDATE name=name;

-- The Lord of the Rings Online™
INSERT INTO gamedevs (name) VALUES ('Turbine, Inc.') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('The Lord of the Rings Online™', (SELECT id FROM gamedevs WHERE name = 'Turbine, Inc.')) ON DUPLICATE KEY UPDATE name=name;

-- The one who pulls out the sword will be crowned king
INSERT INTO gamedevs (name) VALUES ('Rodolfo Pereira') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('The one who pulls out the sword will be crowned king', (SELECT id FROM gamedevs WHERE name = 'Rodolfo Pereira')) ON DUPLICATE KEY UPDATE name=name;

-- The Outer Worlds
INSERT INTO gamedevs (name) VALUES ('Obsidian Entertainment') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('The Outer Worlds', (SELECT id FROM gamedevs WHERE name = 'Obsidian Entertainment')) ON DUPLICATE KEY UPDATE name=name;

-- The Technomancer
INSERT INTO gamedevs (name) VALUES ('Spiders') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('The Technomancer', (SELECT id FROM gamedevs WHERE name = 'Spiders')) ON DUPLICATE KEY UPDATE name=name;

-- The Witcher 2: Assassins of Kings Enhanced Edition
INSERT INTO gamedevs (name) VALUES ('CD Projekt Red') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('The Witcher 2: Assassins of Kings Enhanced Edition', (SELECT id FROM gamedevs WHERE name = 'CD Projekt Red')) ON DUPLICATE KEY UPDATE name=name;

-- The Witcher 3: Wild Hunt
INSERT INTO games (name, developer_id) VALUES ('The Witcher 3: Wild Hunt', (SELECT id FROM gamedevs WHERE name = 'CD Projekt Red')) ON DUPLICATE KEY UPDATE name=name;

-- The Witcher: Enhanced Edition
INSERT INTO games (name, developer_id) VALUES ('The Witcher: Enhanced Edition', (SELECT id FROM gamedevs WHERE name = 'CD Projekt Red')) ON DUPLICATE KEY UPDATE name=name;

-- theHunter: Call of the Wild™
INSERT INTO gamedevs (name) VALUES ('Expansive Worlds') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('theHunter: Call of the Wild™', (SELECT id FROM gamedevs WHERE name = 'Expansive Worlds')) ON DUPLICATE KEY UPDATE name=name;

-- Tiny Tina's Assault on Dragon Keep: A Wonderlands One-shot Adventure
INSERT INTO gamedevs (name) VALUES ('Gearbox Software') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Tiny Tina''s Assault on Dragon Keep: A Wonderlands One-shot Adventure', (SELECT id FROM gamedevs WHERE name = 'Gearbox Software')) ON DUPLICATE KEY UPDATE name=name;

-- Titanfall® 2
INSERT INTO gamedevs (name) VALUES ('Respawn Entertainment') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Titanfall® 2', (SELECT id FROM gamedevs WHERE name = 'Respawn Entertainment')) ON DUPLICATE KEY UPDATE name=name;

-- Titanfall™
INSERT INTO games (name, developer_id) VALUES ('Titanfall™', (SELECT id FROM gamedevs WHERE name = 'Respawn Entertainment')) ON DUPLICATE KEY UPDATE name=name;

-- Tom Clancy's Rainbow Six Siege
INSERT INTO gamedevs (name) VALUES ('Ubisoft') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Tom Clancy''s Rainbow Six Siege', (SELECT id FROM gamedevs WHERE name = 'Ubisoft')) ON DUPLICATE KEY UPDATE name=name;

-- Tomb Raider
INSERT INTO gamedevs (name) VALUES ('Crystal Dynamics') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Tomb Raider', (SELECT id FROM gamedevs WHERE name = 'Crystal Dynamics')) ON DUPLICATE KEY UPDATE name=name;

-- Total War: SHOGUN 2
INSERT INTO gamedevs (name) VALUES ('Creative Assembly') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Total War: SHOGUN 2', (SELECT id FROM gamedevs WHERE name = 'Creative Assembly')) ON DUPLICATE KEY UPDATE name=name;

-- Total War: WARHAMMER
INSERT INTO games (name, developer_id) VALUES ('Total War: WARHAMMER', (SELECT id FROM gamedevs WHERE name = 'Creative Assembly')) ON DUPLICATE KEY UPDATE name=name;

-- Total War: WARHAMMER II
INSERT INTO games (name, developer_id) VALUES ('Total War: WARHAMMER II', (SELECT id FROM gamedevs WHERE name = 'Creative Assembly')) ON DUPLICATE KEY UPDATE name=name;

-- Total War: WARHAMMER III
INSERT INTO games (name, developer_id) VALUES ('Total War: WARHAMMER III', (SELECT id FROM gamedevs WHERE name = 'Creative Assembly')) ON DUPLICATE KEY UPDATE name=name;

-- Turnip Boy Commits Tax Evasion
INSERT INTO gamedevs (name) VALUES ('Snoozy Kazoo') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Turnip Boy Commits Tax Evasion', (SELECT id FROM gamedevs WHERE name = 'Snoozy Kazoo')) ON DUPLICATE KEY UPDATE name=name;

-- Undertale
INSERT INTO gamedevs (name) VALUES ('Toby Fox') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Undertale', (SELECT id FROM gamedevs WHERE name = 'Toby Fox')) ON DUPLICATE KEY UPDATE name=name;

-- Unrailed!
INSERT INTO gamedevs (name) VALUES ('Indoor Astronaut') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Unrailed!', (SELECT id FROM gamedevs WHERE name = 'Indoor Astronaut')) ON DUPLICATE KEY UPDATE name=name;

-- Untitled Goose Game
INSERT INTO gamedevs (name) VALUES ('House House') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Untitled Goose Game', (SELECT id FROM gamedevs WHERE name = 'House House')) ON DUPLICATE KEY UPDATE name=name;

-- Unturned
INSERT INTO gamedevs (name) VALUES ('Smartly Dressed Games') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Unturned', (SELECT id FROM gamedevs WHERE name = 'Smartly Dressed Games')) ON DUPLICATE KEY UPDATE name=name;

-- Vampyr
INSERT INTO gamedevs (name) VALUES ('Dontnod Entertainment') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Vampyr', (SELECT id FROM gamedevs WHERE name = 'Dontnod Entertainment')) ON DUPLICATE KEY UPDATE name=name;

-- Vertical Shift
INSERT INTO gamedevs (name) VALUES ('Secret Location') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Vertical Shift', (SELECT id FROM gamedevs WHERE name = 'Secret Location')) ON DUPLICATE KEY UPDATE name=name;

-- VRChat
INSERT INTO gamedevs (name) VALUES ('VRChat Inc.') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('VRChat', (SELECT id FROM gamedevs WHERE name = 'VRChat Inc.')) ON DUPLICATE KEY UPDATE name=name;

-- War Robots
INSERT INTO gamedevs (name) VALUES ('Pixonic') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('War Robots', (SELECT id FROM gamedevs WHERE name = 'Pixonic')) ON DUPLICATE KEY UPDATE name=name;

-- War Thunder
INSERT INTO gamedevs (name) VALUES ('Gaijin Entertainment') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('War Thunder', (SELECT id FROM gamedevs WHERE name = 'Gaijin Entertainment')) ON DUPLICATE KEY UPDATE name=name;

-- Warframe
INSERT INTO gamedevs (name) VALUES ('Digital Extremes') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Warframe', (SELECT id FROM gamedevs WHERE name = 'Digital Extremes')) ON DUPLICATE KEY UPDATE name=name;

-- Warhammer 40,000: Darktide
INSERT INTO gamedevs (name) VALUES ('Fatshark') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Warhammer 40,000: Darktide', (SELECT id FROM gamedevs WHERE name = 'Fatshark')) ON DUPLICATE KEY UPDATE name=name;

-- Warhammer 40,000: Gladius - Relics of War
INSERT INTO gamedevs (name) VALUES ('Proxy Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Warhammer 40,000: Gladius - Relics of War', (SELECT id FROM gamedevs WHERE name = 'Proxy Studios')) ON DUPLICATE KEY UPDATE name=name;

-- Warhammer 40,000: Shootas, Blood & Teef
INSERT INTO gamedevs (name) VALUES ('Three Rings') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Warhammer 40,000: Shootas, Blood & Teef', (SELECT id FROM gamedevs WHERE name = 'Three Rings')) ON DUPLICATE KEY UPDATE name=name;

-- Warhammer: Vermintide 2
INSERT INTO gamedevs (name) VALUES ('Fatshark') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Warhammer: Vermintide 2', (SELECT id FROM gamedevs WHERE name = 'Fatshark')) ON DUPLICATE KEY UPDATE name=name;

-- Wizard101
INSERT INTO gamedevs (name) VALUES ('KingsIsle Entertainment, Inc.') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Wizard101', (SELECT id FROM gamedevs WHERE name = 'KingsIsle Entertainment, Inc.')) ON DUPLICATE KEY UPDATE name=name;

-- Wolfenstein: Enemy Territory
INSERT INTO gamedevs (name) VALUES ('Splash Damage') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Wolfenstein: Enemy Territory', (SELECT id FROM gamedevs WHERE name = 'Splash Damage')) ON DUPLICATE KEY UPDATE name=name;

-- Wolfenstein: The New Order
INSERT INTO gamedevs (name) VALUES ('MachineGames') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Wolfenstein: The New Order', (SELECT id FROM gamedevs WHERE name = 'MachineGames')) ON DUPLICATE KEY UPDATE name=name;

-- Zenith: Nexus
INSERT INTO gamedevs (name) VALUES ('Ramen VR, Inc.') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Zenith: Nexus', (SELECT id FROM gamedevs WHERE name = 'Ramen VR, Inc.')) ON DUPLICATE KEY UPDATE name=name;

-- Ziggurat 2
INSERT INTO gamedevs (name) VALUES ('Milkstone Studios') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO games (name, developer_id) VALUES ('Ziggurat 2', (SELECT id FROM gamedevs WHERE name = 'Milkstone Studios')) ON DUPLICATE KEY UPDATE name=name;