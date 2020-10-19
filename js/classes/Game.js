class Game {
	constructor(data) {
		this.turn = "enemy"
		this.attackSource = 0
		this.turnOrder = fix(data.turnOrder, ["player", "enemy"])
		this.deck = fix(data.deck, {player: [], enemy: []})
		this.startHP = fix(data.startHP, START_HP)
		this.deckSize = fix(data.deckSize, DECK_SIZE)
		this.custom = fix(data.custom, false)
	}
	
	setupDeck(deck) {
		let list = deck.slice(0, deck.length)
		shuffle(list)
		if (list.length==this.deckSize) return list
		else if (list.length>this.deckSize) return list.slice(0, this.deckSize)
		else {
			let left = this.deckSize-list.length
			for (let i=0;i<left;i++) list.push(list[i%list.length])
			return list
		}
	}
	
	load() {
		this.turn = "enemy"
		this.attackSource = 0
		for (let i=0;i<this.turnOrder.length;i++) {
			let source = this.turnOrder[i]
			this[source] = new Player({
				name: source,
				deck: source=="player"?this.setupDeck(STAGE_DATA[mainData.stage].slice(0, STAGE_DATA[mainData.stage].length)):this.setupDeck(this.deck[source].slice(0, this.deck[source].length)),
				hp: this.startHP,
			})
			this[source].parent = this
			this[source].init()
			this[source].shuffle()
			this[source].update()
		}
		updateListValues(ABILIITY_NAMES, ABILITY_DESCS)
	}
	
	addCard(card, dest) {
		this.deck[dest].push(Object.assign({}, card))
		this.load()
	}
	
	delCard(dest, n, force=false) {
		if (this.deck[dest][n]) if ((this.deck[dest].length<=10 || this.deck[dest][n].edited) && !force) {
			alert("You cannot delete this card!")
			return
		}
		if (!force) if (!confirm("Are you sure you want to delete this card? You won't be able to undo this!")) return
		this.deck[dest].splice(n, 1)
		editor.update()
		this.load()
	}
	
	endGame(winner) {
		document.getElementById("winningPlayer").textContent = winner=="player"?"top":"bottom"
		document.getElementById("playAgainTxt").textContent = this.custom?"Play Again":"Stage Menu"
		this.cw = winner
		this.eg = true
		openMenu("gameDone")
	}
	
	playAgain() {
		let gxp = false
		if (this.cw!="player" && !this.custom && this.eg) {
			for (let i=0;i<Object.keys(mainData.xp).length;i++) {
				let g = gainXP(Object.keys(mainData.xp)[i], getXPGain())
				gxp = gxp||g
			}
			$.notify("All of your custom cards have gained "+getXPGain()+" XP!", "info")
			mainData.stage = Math.min(mainData.stage+1, MAX_STAGE)
			mainData.bestStage = Math.max(mainData.stage, mainData.bestStage)
		}
		setStageMenu();
		openMenu('stageMenu');
		this.eg = false
	}
	
	nextTurn(source) { return this.turnOrder[(this.turnOrder.indexOf(source)+1)%this.turnOrder.length] }
}