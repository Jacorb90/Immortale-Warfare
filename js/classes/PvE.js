class PvE extends Game {
	constructor(data) {
		super(data)
		this.knowledge = {}
		this.pve = true
	}
	
	get canDirectAttack() { return Object.keys(this.player.cards).length>0&&Object.keys(this.enemy.cards).length==0 }
	
	get inFalseStalemate() {
		for (let i=0;i<Object.keys(this.player.cards).length;i++) {
			let card = Object.values(this.player.cards)[i]
			if (this.enemy.deck.length==0) {
				if (card.hasAbility("gloating")||card.hasAbility("regen")) {
					for (let j=0;j<Object.keys(this.enemy.cards).length;j++) {
						let enemyCard = Object.values(this.enemy.cards)[j]
						if (enemyCard.hasAbility("heavy")&&card.pow<2) return true
					}
				}
			}
		}
		return false
	}
	
	getKnowledge(name) { return this.knowledge[name]?this.knowledge[name]:"unavailable" }
	
	updateKnowledge() {
		this.knowledge = {
			myBestHP: [0,0],
			myBestPOW: [0,0],
			myCheapestCost: [0,0],
			oppBestHP: [0,0],
			oppBestPOW: [0,0],
			oppCheapestCost: [0,0],
			oppWorstHP: [0,0],
		}
		for (let i=0;i<Object.values(this.player.cards).length;i++) {
			if (Object.values(this.player.cards)[i].hp>this.knowledge.myBestHP[1]) this.knowledge.myBestHP[0] = Object.keys(this.player.cards)[i]
			this.knowledge.myBestHP[1] = Math.max(this.knowledge.myBestHP[1], Object.values(this.player.cards)[i].hp)
			if (Object.values(this.player.cards)[i].pow>this.knowledge.myBestPOW[1]) this.knowledge.myBestPOW[0] = Object.keys(this.player.cards)[i]
			this.knowledge.myBestPOW[1] = Math.max(this.knowledge.myBestPOW[1], Object.values(this.player.cards)[i].pow)
			if (Object.values(this.player.cards)[i].manaCost<this.knowledge.myCheapestCost[1]||this.knowledge.myCheapestCost[1]==0) {
				this.knowledge.myCheapestCost[0] = Object.keys(this.player.cards)[i]
				this.knowledge.myCheapestCost[1] = Object.values(this.player.cards)[i].manaCost
			}
		}
		for (let i=0;i<Object.values(this.enemy.cards).length;i++) {
			if (Object.values(this.enemy.cards)[i].hp>this.knowledge.oppBestHP[1]) this.knowledge.oppBestHP[0] = Object.keys(this.enemy.cards)[i]
			this.knowledge.oppBestHP[1] = Math.max(this.knowledge.oppBestHP[1], Object.values(this.enemy.cards)[i].hp)
			if (Object.values(this.enemy.cards)[i].pow>this.knowledge.oppBestPOW[1]) this.knowledge.oppBestPOW[0] = Object.keys(this.enemy.cards)[i]
			this.knowledge.oppBestPOW[1] = Math.max(this.knowledge.oppBestPOW[1], Object.values(this.enemy.cards)[i].pow)
			if (Object.values(this.enemy.cards)[i].manaCost<this.knowledge.oppCheapestCost[1]||this.knowledge.oppCheapestCost[1]==0) {
				this.knowledge.oppCheapestCost[0] = Object.keys(this.enemy.cards)[i]
				this.knowledge.oppCheapestCost[1] = Object.values(this.enemy.cards)[i].manaCost
			}
			if (Object.values(this.enemy.cards)[i].hp<this.knowledge.oppWorstHP[1]||this.knowledge.oppWorstHP[1]==0) {
				this.knowledge.oppWorstHP[0] = Object.keys(this.enemy.cards)[i]
				this.knowledge.oppWorstHP[1] = Object.values(this.enemy.cards)[i].hp
			}
		}
	}
	
	async updateAI(recurs=0) {
		if (this.turn=="player") {
			await sleep(AI_SPEED)
			this.updateKnowledge()
			if (this.canDirectAttack) this.player.attackDirect(true)
			else if (this.player.deck.length>0&&Object.keys(this.player.cards).length<MAX_CARDS&&(this.inFalseStalemate||Object.keys(this.player.cards).length==0||(this.getKnowledge("myBestHP")[1]<2&&this.getKnowledge("myBestPOW")[1]<2))) this.player.newCard(true)
			else {
				if (this.player.mana<this.getKnowledge("myCheapestCost")[1]||(this.player.deck.length==0&&Object.keys(this.player.cards).length==0)||this.getKnowledge("myBestPOW")[1]==0||recurs>=2) {
					if (Object.keys(this.player.cards).length==1&&this.player.cards[Object.keys(this.player.cards)[0]].pow==0&&this.player.mana>=8) this.player.newCard(true)
					else this.player.endTurn(true, true)
				} else {
					let mine = this.getKnowledge("myCheapestCost")[0]
					let theirs = this.getKnowledge("oppWorstHP")[0]
					if (this.enemy.cards[theirs].hasAbility("heavy")||this.enemy.cards[theirs].hasAbility("regen")||recurs>=MAX_CARDS||this.player.cards[mine].pow==0) mine = this.getKnowledge("myBestPOW")[0]
					this.player.attack(mine, true)
					await sleep(AI_SPEED)
					this.enemy.attack(theirs, true)
					if (this.player.cards[mine] !== undefined) if (this.player.cards[mine].strikes>0) {
						await sleep(AI_SPEED)
						if (document.getElementById("enemyPos"+theirs) !== undefined) this.enemy.attack(theirs, true)
						else if (this.enemy.cards.length>0) this.enemy.attack(this.getKnowledge("oppWorstHP")[0], true)
						else this.player.endTurn(true, true)
					}
					this.updateAI(recurs+1);
				}
			}
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
	
	endGame(winner) { 
		document.getElementById("winningPlayer").textContent = winner=="player"?"computer":"human"
		document.getElementById("playAgainTxt").textContent = this.custom?"Play Again":"Stage Menu"
		this.cw = winner
		this.eg = true
		openMenu("gameDone")
	}
}