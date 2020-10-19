var menu = "game"
var gameMenu = "mainMenu"
var mode = "PvP"
var tutoralActive = false
var tutoralsDone = []
var mainData = {
	deckCreated: false,
	deck: deepCopy(DECK.enemy),
	levels: {},
	xp: {},
	stage: 1,
	bestStage: 1,
}

var editor = new Editor({
	descs: ABILITY_DESCS,
	names: ABILIITY_NAMES,
	players: ["player", "enemy"],
})

var game = {}

function createDeck() {
	return new Promise(resolve => function() {
		openMenu('editor')
		editor.startChar = true
		editor.created.type = "demigod"
		editor.update()
		let interval = setInterval(function() { if (mainData.deckCreated) resolve(); }, 100)
	}())
}

async function startMode(name, custom=false) {
	mode = name
	editor.init()
	if (name=="PvP") {
		game = new Game({
			turnOrder: ["player", "enemy"],
			deck: {player: deepCopy(DECK.player), enemy: deepCopy(mainData.deck)},
			startHP: START_HP,
			deckSize: DECK_SIZE,
			custom: false,
		})
	} else {
		if (!custom && !mainData.deckCreated) {
			await createDeck()
		}
		game = new PvE({
			turnOrder: ["player", "enemy"],
			deck: {player: deepCopy(DECK.player), enemy: deepCopy(mainData.deck)},
			startHP: START_HP,
			deckSize: DECK_SIZE,
			custom: custom,
		})
	}
	game.load()
	editor.init()
	openGameMenu('battle')
	updateMenus()
}