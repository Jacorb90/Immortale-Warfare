class Player {
	constructor(data) {
		this.name = data.name
		this.deck = fix(data.deck, [])
		this.mana = 0
		this.cards = {}
		this.parent = fix(data.parent, "???")
		this.hp = data.hp
	}
	
	get opponent() {
		let op = ""
		let order = this.parent.turnOrder
		order.map(x => op=(x!=this.name?x:op))
		return op
	}
	
	init() {
		for (let j=0;j<this.deck.length;j++) {
			if (this.deck[j] === undefined) console.error("Initialization error for "+this.name+" at DECK position "+j)
			this.deck[j].parent = this
		}
	}
	
	shuffle() {
		shuffle(this.deck)
	}
	
	update() {
		let updated = []
		for (let i=0;i<Object.keys(this.cards).length;i++) {
			let card = this.cards[Object.keys(this.cards)[i]]
			document.getElementById(this.name+"Pos"+card.pos).innerHTML = card.display()
			document.getElementById(this.name+"Pos"+card.pos).className = "card "+card.type+((this.parent.turn==this.name&&this.parent.attackSource==0)||(this.parent.turn!=this.name&&this.parent.attackSource!=0)?" clickable":"")
			let list = document.getElementById(this.name+"Pos"+card.pos).className.split(" ")
			let bg = list.includes("god")?"#c8d444":(list.includes("demigod")?"#7bbdbc":(list.includes("mortal")?"#c9c9c9":"#F2F2F2"))
			document.getElementById(this.name+"Pos"+card.pos).style.background = this.parent.attackSource != 0 ? (this.parent.attackSource[0]==this.name&&this.parent.attackSource[1].toString()==card.pos?"#37b06d":bg) : bg
			updated.push(card.pos)
		}
		for (let i=1;i<=MAX_CARDS;i++) {
			document.getElementById(this.name+"Pos"+i).className = updated.includes(i.toString()) ? document.getElementById(this.name+"Pos"+i).className : "card"
			document.getElementById(this.name+"Pos"+i).style.opacity = updated.includes(i.toString()) ? "1" : "0"
		}
		document.getElementById(this.name+"HP").innerHTML = this.hp+" "+ascii(9829)
		document.getElementById(this.name+"Mana").innerHTML = this.mana+" "+ascii(128167)
		document.getElementById(this.name+"Div").style.backgroundColor = this.parent.turn==this.name ? "#a2e39f" : "white"
		document.getElementById(this.name+"NewCard").textContent = "New Card ("+this.deck.length+")"
		document.getElementById(this.name+"NewCard").className = "btn"+((getAvailable(this.cards, MAX_CARDS).length>0&&this.parent.turn==this.name&&this.deck.length>0)?"":" disabled")
		document.getElementById(this.name+"EndTurn").className = "btn"+((this.parent.turn==this.name)?"":" disabled")
		let op = this.parent[this.opponent]
		if (op!==undefined) document.getElementById(this.name+"Attack").className = "btn"+((this.parent.turn==this.name&&Object.keys(op.cards).length==0&&Object.keys(this.cards).length>0)?"":" disabled")
		if (this.hp<=0) this.parent.endGame(this.opponent)
	}
	
	endTurn(gainMana=true, ai=false) {
		if (tutoralActive && this.name=="enemy") return
		if (this.parent.pve&&this.name=="player"&&!ai) return
		if (this.parent.turn != this.name) return
		if (gainMana) this.mana++
		this.parent.turn = this.parent.nextTurn(this.name)
		this.parent.attackSource = 0
		for (let i=0;i<Object.keys(this.cards).length;i++) {
			var card = this.cards[Object.keys(this.cards)[i]]
			if (card.hasAbility("supercharger")) this.mana++
			if (card.isStatusActive("bleed")) card.getHurt((card.hasAbility("heavy")||card.hasAbility("elite")) ? (5+4) : 3)
			if (card.isStatusActive("regen")) card.hp=card.hp>=REGEN_SOFTCAP?(Math.round(Math.sqrt(REGEN_SOFTCAP)*Math.sqrt(card.hp+3))):(card.hp+3)
			card.strikes = card.abilities.includes("double strike") ? 2 : 1
		}
		this.update()
		this.parent[this.opponent].update()
		if (this.name=="enemy" && this.parent.pve) this.parent.updateAI()
		if (this.name=="enemy"&&gainMana&&this.mana==0&&this.parent.hp==START_HP&&Object.keys(this.cards).length==0) doTutorial("endTurn") 
	}
	
	newCard(ai=false) {
		if (tutoralActive && this.name=="enemy") return
		if (this.parent.pve&&this.name=="player"&&!ai) return
		if (this.parent.turn != this.name) return
		if (this.deck.length==0) return
		let avail = getAvailable(this.cards, MAX_CARDS)
		if (avail.length==0) return
		let card = this.deck[0]
		card.dp = avail[0]
		if (card.abilities?card.abilities.includes("superbuffer"):false) for (let i=0;i<Object.keys(this.cards).length;i++) Object.values(this.cards)[i].pow+=5
		if (card.abilities?card.abilities.includes("buffer"):false) for (let i=0;i<Object.keys(this.cards).length;i++) Object.values(this.cards)[i].pow+=2
		if (card.abilities?card.abilities.includes("merchant"):false) for (let i=0;i<Object.keys(this.cards).length;i++) Object.values(this.cards)[i].manaCost = Math.max(Object.values(this.cards)[i].manaCost-1, 1)
		this.cards[avail[0]] = new Card(card)
		this.deck.shift()
		this.shuffle()
		this.endTurn(false, ai)
		if (this.deck.length==9 && this.name=="enemy") doTutorial("card")
	}
	
	attack(n, ai=false) {
		if (tutoralActive && this.name=="enemy") return
		if (this.parent.turn == this.name) {
			if (this.parent.pve&&this.name=="player"&&!ai) return
			if (this.parent.attackSource != 0) return
			if (this.cards[n] === undefined) return
			if (this.mana<this.cards[n].manaCost) return
			this.mana -= this.cards[n].manaCost
			this.parent.attackSource = [this.name, n]
			if (this.name=="enemy") doTutorial("cardAttack", n)
		} else {
			if (this.parent.attackSource == 0) return
			if (this.cards[n] === undefined || this.parent[this.opponent].cards[this.parent.attackSource[1]] === undefined) return
			let card = this.cards[n]
			this.cards[n].getHurt(this.parent[this.opponent].cards[this.parent.attackSource[1]].pow, this.parent[this.opponent].cards[this.parent.attackSource[1]])
			if (this.cards[n] !== undefined) if (!this.parent[this.opponent].cards[this.parent.attackSource[1]].hasAbility("ranged")) this.parent[this.opponent].cards[this.parent.attackSource[1]].getHurt(card.pow, card)
			if (this.parent[this.opponent].cards[this.parent.attackSource[1]] !== undefined) {
				this.parent[this.opponent].cards[this.parent.attackSource[1]].strikes--
				if (this.parent[this.opponent].cards[this.parent.attackSource[1]].strikes == 0) this.parent.attackSource = 0
			} else  this.parent.attackSource = 0
			if (Object.keys(this.parent[this.opponent].cards).length>0 && Object.keys(this.cards).length==0 && this.hp==START_HP&&this.name=="player") doTutorial("directPrep")
		}
		this.update()
		this.parent[this.opponent].update()
	}
	
	attackDirect(ai=false) {
		if (tutoralActive && this.name=="enemy") return
		if (this.parent.pve&&this.name=="player"&&!ai) return
		if (!(this.parent.turn==this.name&&Object.keys(this.parent[this.opponent].cards).length==0&&Object.keys(this.cards).length>0)) return
		this.parent[this.opponent].hp--
		this.endTurn(false, ai)
	}
}