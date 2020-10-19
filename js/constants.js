const STATUS_SYMBOLS = {
	bleed: ascii(128137),
	regen: ascii(10133),
}

const REGEN_SOFTCAP = 10

const ABILITY_DESCS = {
	ranged: "When a ranged card attacks, they do not get hit back.",
	heavy: "Heavy cards take 4 less damage.",
	magic: "Magic cards ignore the Heavy ability.",
	sharp: "Sharp cards cause their target to bleed, which makes it lose 3 &#9829; every turn (or 5 &#9829; every turn if the target is Heavy).",
	gloating: "Gloating cards gain 2 &#9829; whenever they attack.",
	bloodsucker: "Bloodsuckers gain 2 &#9829; whenever they attack, and they cause their target to bleed as well.",
	regen: "Regen cards heal 3 &#9829; every turn, but only after they have made an attack. This effect begins to become weaker above "+REGEN_SOFTCAP+" &#9829;.",
	weaken: "Weaken cards weaken their target by 2 &#9876; when attacking them (they cannot get below 0 &#9876;).",
	sapper: "Sapper cards weaken their target by 2 &#9876; when attacking them, which gains the sapper card 2 &#9876; in return.",
	buffer: "Buffer cards increase the &#9876; of all of your other cards by 2 when played.",
	superbuffer: "Superbuffer cards increase the &#9876; of all of your other cards by 5 when played.",
	charger: "Charger cards grant you 1 free &#128167; whenever they attack.",
	supercharger: "Supercharger cards grant you 1 free &#128167; per turn.",
	merchant: "Merchant cards reduce the &#128167; cost of all of your other cards by 1 when played (their cost cannot get below 1 &#128167;).",
	elite: "Elite cards behave like Heavy cards, but Magic cards do not negate this ability.",
	"double strike": "Double Strike cards can attack two different targets with one attack (or the same one twice)."
}

const ABILIITY_NAMES = Object.keys(ABILITY_DESCS)

const ALL_CARDS = {
	MORTAL: {
		// Level 1: 30 SP
		knight: {name: "Knight", hp: 20, pow: 10, manaCost: 2, type: "mortal"},
		archer: {name: "Archer", hp: 10, pow: 10, manaCost: 2, abilities: ["ranged"], type: "mortal"},
		cavalry: {name: "Cavalry", hp: 10, pow: 5, manaCost: 2, abilities: ["heavy"], type: "mortal"},
		"small tower": {name: "Small Tower", hp: 15, pow: 0, manaCost: 2, abilities: ["heavy"], type: "mortal"},
		wizard: {name: "Wizard", hp: 15, pow: 5, manaCost: 2, abilities: ["magic"], type: "mortal"},
		blademaster: {name: "Blademaster", hp: 10, pow: 5, manaCost: 2, abilities: ["sharp"], type: "mortal"},
		witch: {name: "Witch", hp: 10, pow: 10, manaCost: 2, abilities: ["magic"], type: "mortal"},
		thief: {name: "Thief", hp: 5, pow: 10, manaCost: 2, abilities: ["sharp"], type: "mortal"},
		// Level 2: 33 SP
		swordsmith: {name: "Swordsmith", hp: 10, pow: 3, manaCost: 2, abilities: ["buffer"], type: "mortal"},
		spartan: {name: "Spartan", hp: 12, pow: 21, manaCost: 2, type: "mortal"},
		// Level 3: 36 SP
		berserker: {name: "Berserker", hp: 6, pow: 30, manaCost: 2, type: "mortal"},
		mage: {name: "Mage", hp: 10, pow: 6, manaCost: 3, abilities: ["regen"], type: "mortal"},
	},
}

const DECK = {
	player: [deepCopy(ALL_CARDS.MORTAL.knight),
		deepCopy(ALL_CARDS.MORTAL.archer),
		deepCopy(ALL_CARDS.MORTAL.cavalry),
		deepCopy(ALL_CARDS.MORTAL["small tower"]),
		deepCopy(ALL_CARDS.MORTAL.wizard),
		deepCopy(ALL_CARDS.MORTAL.blademaster),
		deepCopy(ALL_CARDS.MORTAL.thief),
		deepCopy(ALL_CARDS.MORTAL.swordsmith),
		deepCopy(ALL_CARDS.MORTAL.spartan)],

	enemy: [deepCopy(ALL_CARDS.MORTAL.knight),
		deepCopy(ALL_CARDS.MORTAL.archer),
		deepCopy(ALL_CARDS.MORTAL.cavalry),
		deepCopy(ALL_CARDS.MORTAL["small tower"]),
		deepCopy(ALL_CARDS.MORTAL.wizard),
		deepCopy(ALL_CARDS.MORTAL.blademaster),
		deepCopy(ALL_CARDS.MORTAL.thief),
		deepCopy(ALL_CARDS.MORTAL.swordsmith),
		deepCopy(ALL_CARDS.MORTAL.spartan)],
}

const VALID_KEYS = ["name", "hp", "pow", "manaCost", "abilities", "type", "edited"]
const TYPES = ["mortal", "demigod", "god"]

const DECK_SIZE = 10
const START_HP = 5
const MAX_CARDS = 5

const AI_SPEED = 1

const MAX_CIPHER_SHIFT = 26
const CIPHER_B64_APPS = 5

const SP_INCS = ["hp", "pow"]
const MCE = {mortal: 2/3, demigod: 1/2, god: 1/3}
const ABILITY_COSTS = {
	ranged: 10,
	heavy: 15,
	magic: 10,
	sharp: 15,
	gloating: 20,
	bloodsucker: 35,
	regen: 25,
	weaken: 15,
	sapper: 25,
	buffer: 20,
	superbuffer: 30,
	charger: 50,
	supercharger: 75,
	merchant: 60,
	elite: 40,
	"double strike": 50,
}
const START_SP = {
	mortal: 30,
	demigod: 50,
	god: 80
}

const LEVEL_INC = {
	mortal: 3,
	demigod: 5,
	god: 10,
}
const START_LEVEL_REQ = {
	mortal: 100,
	demigod: 300,
	god: 750,
}
const LVL_SC = 20

const STAGE_DATA = {
	0: [deepCopy(ALL_CARDS.MORTAL.archer),
		deepCopy(ALL_CARDS.MORTAL.thief),
		deepCopy(ALL_CARDS.MORTAL.cavalry)],
	
	1: [deepCopy(ALL_CARDS.MORTAL.knight),
		deepCopy(ALL_CARDS.MORTAL.archer),
		deepCopy(ALL_CARDS.MORTAL.cavalry),
		deepCopy(ALL_CARDS.MORTAL["small tower"])],

	2: [deepCopy(ALL_CARDS.MORTAL.wizard),
		deepCopy(ALL_CARDS.MORTAL.blademaster),
		deepCopy(ALL_CARDS.MORTAL.thief),
		deepCopy(ALL_CARDS.MORTAL.swordsmith),
		deepCopy(ALL_CARDS.MORTAL.spartan)],
		
	3: [deepCopy(ALL_CARDS.MORTAL.knight),
		deepCopy(ALL_CARDS.MORTAL["small tower"]),
		deepCopy(ALL_CARDS.MORTAL.blademaster),
		deepCopy(ALL_CARDS.MORTAL.swordsmith),
		deepCopy(ALL_CARDS.MORTAL.berserker),
		deepCopy(ALL_CARDS.MORTAL.mage)],
}
const MAX_STAGE = Object.keys(STAGE_DATA).length-1