function fix(v, def) { return (v===undefined?def:v); }

function shuffle(array) { array.sort(() => Math.random() - 0.5); }

function deepCopy(obj) { return (typeof obj == "object" ? JSON.parse(JSON.stringify(obj)) : [...obj]) }

function getAvailable(obj, max) {
	arr = Object.keys(obj)
	missing = []
	for (i=1;i<=max;i++) if (!arr.includes(i.toString())) missing.push(i)
	return missing
}

function findInObj(obj, value) {
	for (i=0;i<Object.keys(obj).length;i++) {
		name = Object.keys(obj)[i]
		if (obj[name] instanceof Card ? obj[name].equals(value) : obj[name]==value) return name
	}
}

function ascii(code) { return "&#"+code+";" }

function capitalFirst(str) { return str.split(" ").map(x => x[0].toUpperCase()+x.slice(1)).join(" "); }

function menuTBDisplayed(name) {
	if (name=="editor" && !game.custom) return false
	return (mainData.deckCreated||(!(mode=="PvE" && !game.custom)))
}

function openMenu(name) {
	if (menu==name) return
	menu = name
	if (name=="editor"||name=="deck") editor.update()
	updateMenus()
}

function updateMenus() {
	var menus = document.getElementsByClassName("menu")
	for (i=0;i<menus.length;i++) {
		document.getElementById(menus[i].id).style.display = menu==menus[i].id?"":"none"
		if (document.getElementById(menus[i].id+"tabbtn")) {
			document.getElementById(menus[i].id+"tabbtn").className = "btn menubtn"+(menu==menus[i].id?" disabled":"")
			document.getElementById(menus[i].id+"tabbtn").style.display = menuTBDisplayed(menus[i].id) ? "" : "none"
		}
	}
	document.getElementById("menus").style.display = ((!game.custom&&menu=="editor")||menu=="gameDone"||gameMenu!="battle"||menu=="stageMenu")?"none":""
	document.getElementById("menuPush").style.display = document.getElementById("menus").style.display
}

function openGameMenu(name) {
	if (gameMenu==name) return
	gameMenu = name
	updateGameMenus()
}

function updateGameMenus() {
	var menus = document.getElementsByClassName("gameMenu")
	for (i=0;i<menus.length;i++) document.getElementById(menus[i].id).style.display = gameMenu==menus[i].id?"":"none"
	if (gameMenu=="battle") document.getElementById("menus").style.display = ""
	document.getElementById("menuPush").style.display = document.getElementById("menus").style.display
}

function updateListValues(names, descs) {
	let lV = ""
	for (let i=0;i<names.length;i++) lV += "<li><b>"+capitalFirst(names[i])+"</b><br>"+descs[names[i]]+"</li><li><br></li>"
	document.getElementById("listValues").innerHTML = lV
}

function sleep(s) {
	return new Promise(resolve => setTimeout(resolve, s*1000));
}

function getTotalSkillPoints() {
	let level = getLevel(editor.created.name)
	if (level>=LVL_SC) level = Math.sqrt(level)*Math.sqrt(LVL_SC)
	return Math.round(START_SP[editor.created.type]+LEVEL_INC[editor.created.type]*(level-1))
}

function getSkillPointsSpent() { return (editor.created.hp-1)+editor.created.pow+(editor.created.abilities.length>0?(editor.created.abilities.length>1?editor.created.abilities.reduce((x,y) => ABILITY_COSTS[x]+ABILITY_COSTS[y]):ABILITY_COSTS[editor.created.abilities[0]]):0) }

function getSkillPoints() { return getTotalSkillPoints()-getSkillPointsSpent() }

function getMCEfficiency() { return MCE[editor.created.type] }

function getManaCost() { return Math.max(Math.max(Math.round(((Math.max(getSkillPointsSpent()-(LEVEL_INC[editor.created.type]*(getLevel(editor.created.name)-1)), 0))/10)*getMCEfficiency()), Math.round(getSkillPointsSpent()/20)), 1) }

function getLevel(name) { return mainData.levels[name]?mainData.levels[name]:1 }

function getLevelReq(lvl, type) { return Math.round(Math.pow(lvl, 1.4)*START_LEVEL_REQ[type]) }

function getXPGain() {
	let stage = mainData.stage
	let data = STAGE_DATA[stage]
	let gain = 0
	for (let i=0;i<data.length;i++) {
		let card = data[i]
		let abilities = card.abilities
		if (abilities===undefined) abilities = []
		
		let ag = 0
		if (abilities.length==0) ag = 0
		else if (abilities.length==1) ag = ABILITY_COSTS[abilities[0]]
		else if (abilities.length>1) ag = abilities.reduce((x,y) => ABILITY_COSTS[x]+ABILITY_COSTS[y])
		gain += card.hp+card.pow+ag
	}
	return gain
}

function gainXP(name, gain) {
	mainData.xp[name] += gain
	let lu = false
	let index = mainData.deck.map(x => x.name).indexOf(name)
	if (mainData.xp[name]>=getLevelReq(mainData.levels[name], mainData.deck[index].type)) {
		lu = true
		mainData.levels[name]++
		$.notify("Your "+capitalFirst(name)+" has leveled up!", "success")
	}
	return lu
}

function setStageMenu() {
	let sm = "<b>Stages</b><br><br><table>"
	let totalRows = 10
	for (let n=0;n<=10;n++) {
		sm+="<tr>"
		for (let c=1;c<=Math.floor((mainData.bestStage-n)/10+1);c++) {
			let num = (c-1)*10+n
			if (n==0&&c>1) continue;
			if (mainData.bestStage>=num) sm+="<td><button class='btn' onclick='goToStage("+num+")'>"+getStageName(num)+"</button></td>"
		}
		sm+="</tr>"
	}
	document.getElementById("stageMenu").innerHTML = sm
}

function goToStage(n) {
	mainData.stage = n
	game.load()
	openMenu("game")
	doTutorial("start")
}

function getStageName(n) {
	if (n==0) return "Tutorial"
	else return "Stage "+n
}

function inTutorial(name="none") { return mainData.stage==0&&game.pve&&!game.custom&&!tutoralsDone.includes(name) }

async function doTutorial(type, mod="none") {
	if (!inTutorial(name)) return
	tutoralActive = true
	if (type=="start") {
		$("#enemyHP").notify("This heart symbol is your player HP. If this reaches 0, you lose.\nYour goal is to get the opponent's HP to 0.", "info")
		await sleep(5)
		$("#enemyMana").notify("This blue droplet symbol is your player mana.\nYou will need mana to use cards.", "info")
		await sleep(5)
		$("#enemyNewCard").notify("Click here to use your turn to draw a new card onto the field.", "info")
		await sleep(5)
		$("#enemyEndTurn").notify("Click here to use your turn to gain 1 mana.", "info")
		await sleep(5)
		$("#enemyAttack").notify("Click here to use your turn to hurt the opponent. You need a card on the field\nThe opponent cannot have any cards on the field in order for you to do this.", "info")
	} else if (type=="card") {
		$("#enemyPos1").notify("The heart symbol represents the card's HP, the sword symbol represents the card's DMG,\nand the blue droplet symbol represents the card's mana cost.", "info")
		await sleep(5)
		$("#enemyPos1").notify("Once you get enough mana, you can click on the card to spend your mana to attack with this card.", "info")
	} else if (type=="endTurn") {
		$("enemyHP").notify("Oh no! The enemy has casted a card before you, and has gotten the upper hand!\nMake sure you cast a card next turn, or you might be in trouble!", "warn")
	} else if (type=="cardAttack") {
		$("#enemyPos"+mod).notify("Congratulations! You have initialized an attack!", "info")
		await sleep(5)
		$("enemyPos"+mod).notify("Now you can click on one of the opponents cards to attack that card with yours!", "info")
	} else if (type=="directPrep") {
		$("#enemyAttack").notify("Now you can directly attack the opponent!\nJust click the direct attack button here to attack them directly!", "success")
		await sleep(5)
		$("#enemyAttack").notify("Once you do this, you will only need to do it 4 more times to win!", "info")
	}
	await sleep(5)
	tutoralActive = false
	tutoralsDone.push(type)
}