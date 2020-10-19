class Editor {
	constructor(data) {
		this.created = {name: "Name", hp: 1, pow: 0, manaCost: 0, abilities: [], type: "mortal"}
		this.descs = data.descs
		this.names = data.names
		this.players = data.players
		this.listeners = []
		this.fileErrorText = {player: "", enemy: ""}
	}

	resetListeners() {
		if (this.listeners.length>0) {
			this.listeners = []
			document.getElementById("playerFileInput").removeEventListener('change', this.handleUpload["player"], false)
			document.getElementById("enemyFileInput").removeEventListener('change', this.handleUpload["enemy"], false)
		}
		this.listeners.push(document.getElementById("playerFileInput").addEventListener('change', this.handleUpload["player"], false))
		this.listeners.push(document.getElementById("enemyFileInput").addEventListener('change', this.handleUpload["enemy"], false))
	}
	
	update() {
		this.created.edited = true
		if (this.created.name=="") this.created.name = "Name"
		let val = document.getElementById('abilityList').value
		let tl = document.getElementById('typeList').value
		let card = this.created
		let levels = mainData.levels
		let xp = mainData.xp
		document.getElementById("editorCard").innerHTML = new Card(card).display()+"<br>"+((game.custom||levels=={}||!card.edited)?"":("Level "+(levels[card.name]?levels[card.name]:1)))+"<br>"+((game.custom||xp=={}||!card.edited)?"":("XP: "+(xp[card.name]?xp[card.name]:0)+" / "+getLevelReq(levels[card.name]?levels[card.name]:1, card.type)))
		document.getElementById("editorCard").className = "card "+card.type
		let aL = ""
		for (let i=0;i<this.names.length;i++) aL += "<option value='"+this.names[i]+"'>"+capitalFirst(this.names[i])+"</option>"
		document.getElementById("abilityList").innerHTML = aL
		let vL = ""
		for (let i=0;i<TYPES.length;i++) vL += "<option value='"+TYPES[i]+"'>"+capitalFirst(TYPES[i])+"</option>"
		if (!game.custom) this.created.manaCost = getManaCost()
		document.getElementById('typeList').innerHTML = vL
		document.getElementById("addAbility").className = (!(this.names.includes(val)&&!this.created.abilities.includes(val)&&(game.custom||getSkillPoints()>=ABILITY_COSTS[val])))?"btn disabled":"btn"
		document.getElementById("removeAbility").className = (this.created.abilities.length>0)?"btn":"btn disabled"
		document.getElementById('abilityList').value = val
		document.getElementById("typeList").value = tl
		document.getElementById("typeListRow").style.display = this.startChar?"none":""
		document.getElementById("skillPoints").textContent = game.custom?"":("Stat Points: "+getSkillPoints()+"/"+getTotalSkillPoints())
		document.getElementById("manaCostFixed").textContent = game.custom?"":this.created.manaCost
		document.getElementById("addAbilityCost").innerHTML = game.custom?"":(this.names.includes(val)?"<br>Cost: "+ABILITY_COSTS[val]+" Skill Points":"")
		document.getElementById("rename").style.display = this.noNameChange?"none":""
		document.getElementById("nameSet").textContent = this.noNameChange?this.created.name:""
		document.getElementById("addCardTD").textContent = game.custom?"Add Card To Deck":"Confirm"
		
		updateListValues(this.names, this.descs)
		for (let i=0;i<this.players.length;i++) {
			let source = this.players[i]
			let d = ""
			let ds = ""
			let deck = game.deck?game.deck[source]:(source=="enemy"?mainData.deck:DECK.player)
			for (let j=0;j<deck.length;j++) {
				let card = deck[j]
				let tempCard = Object.assign({}, card)
				delete tempCard.parent
				d += "<td class='card "+card.type+" deletable' onclick='game.delCard(&quot;"+source+"&quot;, "+j+")'>"+new Card(card).display()+"<br>"+((game.custom||levels=={}||!tempCard.edited)?"":("Level "+levels[card.name]))+"<br>"+((game.custom||xp=={}||!card.edited)?"":("XP: "+(xp[card.name]?xp[card.name]:0)+" / "+getLevelReq(levels[card.name]?levels[card.name]:1, card.type)))+"<br>"+"</td>"
				if (game.custom) ds += "<td><button class='btn' onclick='editor.saveCard("+JSON.stringify(tempCard)+", &quot;"+card.name+".card&quot;)'>Save Card</button></td>"
				else if (tempCard.edited) ds += "<td><button class='btn' onclick='editor.startEdit("+JSON.stringify(tempCard)+", "+j+")'>Edit Card</button></td>"
				else ds += "<td><button class='btn' style='visibility: hidden'></button></td>"
			}
			document.getElementById(source+"Deck").innerHTML = d
			document.getElementById(source+"DeckSave").innerHTML = ds
			document.getElementById(source+"FileInsert").innerHTML = "<td><input id='"+source+"FileInput' type='file' name='files[]'></input><br>"+this.fileErrorText[source]+"</td>"
		}
		
		document.getElementById("hpCostAdj").value = this.created.hp
		document.getElementById("powCostAdj").value = this.created.pow
		document.getElementById("manaCostAdj").value = this.created.manaCost
		this.resetListeners()
	}
	
	fileError(e, source) {
		this.fileErrorText[source] = e
		this.update()
	}
	
	isValid(card) {
		// Key Check
		let keys = Object.keys(card)
		for (let i=0;i<keys.length;i++) if (!VALID_KEYS.includes(keys[i])) return false
		if (keys.length>VALID_KEYS.length) return false
		
		// Name Check
		if (card.name === undefined) return false
		if (typeof card.name !== "string") return false
		
		// HP Check
		if (card.hp === undefined) return false
		if (typeof card.hp !== "number") return false
		
		// POW Check
		if (card.pow === undefined) return false
		if (typeof card.pow !== "number") return false
		
		// Mana Cost Check
		if (card.manaCost === undefined) return false
		if (typeof card.manaCost !== "number") return false
		
		// Ability Check
		if (card.abilities !== undefined) {
			if (!Array.isArray(card.abilities)) return false
			for (let i=0;i<card.abilities.length;i++) if (!ABILIITY_NAMES.includes(card.abilities[i])) return false
		}
		
		return true
	}
	
	init() {
		document.getElementById("playerDeck").style.display = "none"
		document.getElementById("playerDeckSave").style.display = "none"
		document.getElementById("playerFileInsert").style.display = "none"
		document.getElementById("enemyFileInsert").style.display = game.custom?"":"none"
		document.getElementById("editorTitle").innerHTML = game.custom?"":"<b>Create your Demigod</b>"
		document.getElementById("skillPoints").style.display = game.custom?"none":""
		document.getElementById("manaCostAdj").style.display = game.custom?"":"none"
		
		this.saveCard = (function () {
			var a = document.createElement("a");
			document.body.appendChild(a);
			a.style = "display: none";
			return function (data, fileName) {
				var json = Cipher.encode(data),
					blob = new Blob([json], {type: "octet/stream"}),
					url = window.URL.createObjectURL(blob);
				a.href = url;
				a.download = fileName.replace(" ", "_");
				a.click();
				window.URL.revokeObjectURL(url);
			};
		}());
		
		this.handleUpload = {
			player: function(evt) {
				let file = evt.target.files[0]
				let fileName = file.name
				if ((fileName.substring(fileName.lastIndexOf('.')+1, fileName.length) || fileName.split('.').pop())!="card") {
					editor.fileError("Needs a .card file.", "player");
					return
				}
				var blob = new Blob([file], {type: "octet/stream"})
				function successCallback(result) {
					let card = Cipher.decode(result)
					if (!editor.isValid(card)) {
						editor.fileError("This .card file is corrupted.", "player")
						return
					}
					game.addCard(card, "player")
					editor.update()
				}
				function failureCallback(error) { console.error("Tried to upload "+fileName+" to top player, but got "+error+" instead.") }
				blob.text().then(successCallback, failureCallback);
			}, 
			enemy: function(evt) {
				let file = evt.target.files[0]
				let fileName = file.name
				if ((fileName.substring(fileName.lastIndexOf('.')+1, fileName.length) || fileName.split('.').pop())!="card") {
					editor.fileError("Needs a .card file.", "enemy");
					return
				}
				var blob = new Blob([file], {type: "octet/stream"})
				function successCallback(result) {
					let card = Cipher.decode(result)
					if (!editor.isValid(card)) {
						editor.fileError("This .card file is corrupted.", "enemy")
						return
					}
					game.addCard(card, "enemy")
					editor.update()
				}
				function failureCallback(error) { console.error("Tried to upload "+fileName+" to bottom player, but got "+error+" instead.") }
				blob.text().then(successCallback, failureCallback);
			},
		}
	}
	
	editVal(t, v) {
		if (SP_INCS.includes(t)) {
			let cap = 1/0
			if (!game.custom) cap = this.created[t]+getSkillPoints()
			this.created[t] = Math.min(v, cap)
		} else this.created[t] = v
		if (!game.custom) this.created.manaCost = getManaCost()
		this.update()
	}
	
	removeAbility() {
		if (this.created.abilities.length==0) return
		this.created.abilities.pop();
		this.update()
	}
	
	addAbility(name) {
		name = name.toLowerCase()
		if (!(this.names.includes(name)&&!this.created.abilities.includes(name)&&(game.custom||getSkillPoints()>=ABILITY_COSTS[name]))) return
		this.created.abilities.push(name)
		this.update()
	}
	
	startEdit(data, pos) {
		this.created = Object.assign({}, data)
		this.noNameChange = true
		openMenu("editor")
		game.delCard("enemy", pos, true)
	}
	
	submit() {
		if (game.custom) game.addCard(this.created, 'enemy');
		else {
			mainData.deck[mainData.deck.length]=deepCopy(this.created);
			if (mainData.deckCreated) game.addCard(this.created, 'enemy');
			else mainData.deckCreated = true;
			if (!mainData.levels[this.created.name]) mainData.levels[this.created.name] = 1;
			if (mainData.xp[this.created.name] === undefined) mainData.xp[this.created.name] = 0
			if (game.load !== undefined) game.load();
			setStageMenu();
			openMenu('stageMenu');
		}
	}
}