class Cipher {
	constructor(data) {
		this.txt = data.txt
		this.shift = data.shift
	}
	
	doShifts(mod) { this.txt = this.txt.split("").map(x => String.fromCharCode(x.charCodeAt(0)+this.shift*mod)).join("") }
	
	static b64(txt, app) {
		let rev = app<0
		if (rev) app = 0-app
		for (let i=1;i<=app;i++) txt = (rev ? atob(txt) : btoa(txt))
		return txt
	}
	
	static encode(data) {
		let str = JSON.stringify(data)
		let cipher = new Cipher({
			txt: btoa(str),
			shift: Math.round((Math.random()-0.5)*MAX_CIPHER_SHIFT),
		})
		cipher.doShifts(1)
		return Cipher.b64(JSON.stringify(cipher), CIPHER_B64_APPS)
	}
	
	static decode(input) {
		let c = JSON.parse(Cipher.b64(input, 0-CIPHER_B64_APPS))
		let cipher = new Cipher({
			txt: c.txt,
			shift: c.shift,
		})
		cipher.doShifts(-1)
		return JSON.parse(atob(cipher.txt))
	}
}