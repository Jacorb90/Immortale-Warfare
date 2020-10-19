class Card {
	constructor(data) {
		data = fix(data, {})
		this.name = fix(data.name, "???")
		this.id = Math.round(Math.random()*1e9)
		this.hp = fix(data.hp, 1)
		this.pow = fix(data.pow, 0)
		this.manaCost = fix(data.manaCost, 1)
		this.abilities = fix(data.abilities, [])
		this.parent = fix(data.parent, "???")
		this.dp = fix(data.dp, 0)
		this.statuses = []
		this.strikes = this.abilities.includes("double strike") ? 2 : 1
		this.type = fix(data.type, "mortal")
	}

	get pos() { 
		if (this.parent == "???") return 0
		return fix(findInObj(this.parent.cards, this), this.dp)
	}
	
	hasAbility(name) { return this.abilities.includes(name) }
	
	isStatusActive(name) { return this.statuses.includes(name) }
	
	equals(other) { return this.id == other.id }
	
	die() {
		delete this.parent.cards[this.pos]
	}
	
	getHurt(dmg, orig={}) {
		let abilities = fix(orig.abilities, [])
		if ((this.hasAbility("heavy") && !abilities.includes("magic")) || this.hasAbility("elite")) dmg-=4
		if (orig.abilities !== undefined) if (orig.hasAbility("regen") && !orig.statuses.includes("regen")) orig.statuses.push("regen")
		if (orig.statuses !== undefined) if ((orig.hasAbility("sharp") || orig.hasAbility("bloodsucker")) && !this.statuses.includes("bleed")) this.statuses.push("bleed")
		if (abilities.includes("weaken") || abilities.includes("sapper")) this.pow = Math.max(this.pow-2, 0)
		if ((abilities.includes("gloating") || abilities.includes("bloodsucker")) && orig.hp !== undefined) orig.hp+=2
		if (abilities.includes("sapper") && orig.pow !== undefined) orig.pow+=2
		if (abilities.includes("charger") && orig.parent !== undefined) orig.parent.mana++
		this.hp -= Math.max(fix(dmg, 0), 0)
		if (Math.round(this.hp)<=0) {
			this.hp = 0
			this.die()
		}
	}
	
	setParent(par) { this.parent = fix(par, this.parent) }
	
	doTurn(action="pass", target="none") {
		if (action=="pass") return
		if (action=="attack") {
			if (this.parent == "???" || target == "none") {
				console.error("Parent or target of "+this.name+" is undefined. Sorry, can't attack :(")
				return
			}
			this.parent.cards[target].getHurt(this.attackPower)
		}
	}
	
	display() { return this.name+"<br>"+Math.round(this.hp)+" "+ascii(9829)+" | "+this.pow+" "+ascii(9876)+" | "+this.manaCost+" "+ascii(128167)+"<br>"+this.abilities.map(x => capitalFirst(x)).join(", ")+"<br>"+this.statuses.map(x => STATUS_SYMBOLS[x]).join(" ") }
}