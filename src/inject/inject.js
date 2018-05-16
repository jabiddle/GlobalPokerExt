(function() {
	//'use strict';
	
	// PLAYER ACTION STRINGS
	const FOLD = "Fold";
	const CHECK = "Check";
	const CALL = "Call";
	const RAISE = "Raise";
	const BET = "Bet";
	const MUCK = "Muck";
	const ANTE = "Ante";
	const BIG_BLIND = "Big Blind";
	const SMALL_BLIND = "Small Blind";
	const DEAD_SMALL_BLIND = "Dead Small Blind";
	const DEAD_BIG_BLIND = "Dead Big Blind";
	const BB_DEAD_SMALL = "BB + Dead Small"; // TODOOOOOOO: this one needs added to actions
	const ENTRY_BET = "Entry Bet";
	const VOID_BET = "Void Bet"; // Used to void bets that don't actually occur
	// const DEAD_BLIND = "DEAD BLIND";
	
	// PLAYER STATUS STRINGS
	const WAITING = "Waiting";
	const SITTING_OUT = "Sitting Out";
	const DISCONNECTED = "Disconnected";

	// Table states
	const SPREFLOP = "Preflop";
	const SFLOP = "Flop";
	const STURN = "Turn";
	const SRIVER = "River";

	const PREFLOP = 0;
	const FLOP = 1;
	const TURN = 2;
	const RIVER = 3;

	// Naming conventions: (highcard)(lowcard)(suited)  : a k q j t 9 8 7 6 5 4 3 2 	: o s
	const EARLY_HANDS = ["aao","kko","qqo","aks","jjo","tto","aqs","ajs","ako","kqs","ats","kjs","aqo"];
	const MIDDLE_HANDS = ["99o","qjs","88o","jts","t9s","ajo"];
	const LATE_HANDS = ["77o","66o","55o","98s","87s","a9s","a8s","a7s","a6s","a5s","a4s","a3s","a2s"];
	
	const EARLY_POSITION = 0;
	const MIDDLE_POSITION = 1/3;
	const LATE_POSITION = 2/3;


	class TableRecord {
		constructor(tableName) {
			this.tableName = tableName;
			this.timeStamp = Math.floor(Date.now() / 1000);
			this.blinds = [,,]; // 0 ante, 1 small blind, 2 big blind
			this.players = []; // Listed in position 0 is small blind
			this.actions = []; // Listed in order
			this.result = [];
		}

		newPlayer() {
			return {name:"", hand:""};
		}

		newAction() {
			return {action:"", value:"", player:""};
		}

		newResult() {
			return {players:[], potSize:""};
		}
	
		// Update the blinds level for this record
		setBlinds(ante, small, big) {
			this.blinds[0] = ante;
			this.blinds[1] = small;
			this.blinds[2] = big;
		}
	
		// Players must be added in order starting with small blind and ending with the button
		addPlayer(name) {
			var tempPlayer = this.newPlayer();
			tempPlayer.name = name;

			this.players.push(tempPlayer);
		}
	
		// Append the player's cards after their name
		addHand(name, hand) {
			for (var i = 0; i < this.players.length; i++) {
				if (this.players[i].name === name) {
					this.players[i].hand = hand;
					return;
				}
			}
		}
	
		// Must be added in order, inlude blind or entry bet actions
		addAction(action, value, player) {
			var tempAction = this.newAction();

			tempAction.action = action;
			tempAction.value = value;
			tempAction.player = player;
		}
	
		// Final results: Start from last sidepot and work to main pot
		addResult(winners, potSize) {
			var tempResult = this.newResult();
			tempResult.players = winners; // Array for possible split pots
			tempResult.potSize = potSize;

			this.result.push(tempResult);
		}

		getDateString() {
			// Create a new JavaScript Date object based on the timestamp
			// multiplied by 1000 so that the argument is in milliseconds, not seconds.
			var dateObject = new Date(this.timeStamp);
			// Hours part from the timestamp
			var hh = dateObject.getHours();
			// Minutes part from the timestamp
			var mm = "0" + dateObject.getMinutes();
			// Seconds part from the timestamp
			var ss = "0" + dateObject.getSeconds();

			var dd = "0" + dateObject.getDate();
			var mm = "0" + dateObject.getMonth()+1; //January is 0!
			var yyyy = dateObject.getFullYear();

			if(dd < 10){
				dd = '0' + dd;
			} 
			if(mm < 10){
				mm = '0' + mm;
			} 
			var date = mm.substr(-2)+'/'+dd.substr(-2)+'/'+yyyy;
			var time = hh + ':' + mm.substr(-2) + ':' + ss.substr(-2)

			return date + " " + time + " UTC";  // Example: 05/28/1995 09:53:12 UTC
		}

		toText() {
			var text = "";
			text += this.tableName + "\n";
			text += this.getDateString();


			// TODO: Build the text document output

			/*switch(action) {
				case RAISE:
				case BET:
				this.actions.push(player + ": " + action + "$" + value);
				break;

				case CALL:
				case CHECK:
				case FOLD:
				case DEAD_SMALL_BLIND:
				case DEAD_BIG_BLIND:
				case SMALL_BLIND:
				case BIG_BLIND:
				this.actions.push(player + ": " + action);
				break;

				case ANTE:
				this.actions.push("Ante $" + value);
				break;

				default:
				this.actions.push(player + action + value);
			}*/
		}
	}
	
	
	
	/*chrome.extension.sendMessage({}, function(response) {
		
	});*/
	
	class Util {
		static canPlay(cards, betPosition) {

			// Make sure we have both cards
			if (!cards[0] || !cards[1])
				return;

			// Sort the cards
			var simple = Util.convertSimpleCards(cards);
			console.log("SIMPLE: " + simple);
			// Early position
			if (betPosition >= EARLY_POSITION) {
				for (var i = 0; i < EARLY_HANDS.length; i++) {
					if (simple === EARLY_HANDS[i])
						return true;
				}
			}

			// Early position
			if (betPosition >= MIDDLE_POSITION) {
				for (var i = 0; i < MIDDLE_HANDS.length; i++) {
					if (simple === MIDDLE_HANDS[i])
						return true;
				}
			}

			// Early position
			if (betPosition >= LATE_POSITION) {
				for (var i = 0; i < LATE_HANDS.length; i++) {
					if (simple === LATE_HANDS[i])
						return true;
				}
			}

			return false;
		}

		static convertSimpleCards(cards) {
			// Sort the cards
			cards = Util.compareCards(cards);
			//console.log("SORTED: " + cards[0] + cards[1]);
			// Check if the suits are the same
			if (cards[0].charAt(1) === cards[1].charAt(1)) {
				return cards[0].charAt(0) + cards[1].charAt(0) + "s"; // Suited
			}
			else {
				return cards[0].charAt(0) + cards[1].charAt(0) + "o"; // Offsuit
			}
		}

		static compareCards(cards) {
			var value = [,];
			for (var i = 0; i < 2; i++) {
				switch(cards[i].charAt(0)) {
					case 'a': value[i] = 14; break;
					case 'k': value[i] = 13; break;
					case 'q': value[i] = 12; break;
					case 'j': value[i] = 11; break;
					case 't': value[i] = 10; break;
					case '9': value[i] = 9; break;
					case '8': value[i] = 8; break;
					case '7': value[i] = 7; break;
					case '6': value[i] = 6; break;
					case '5': value[i] = 5; break;
					case '4': value[i] = 4; break;
					case '3': value[i] = 3; break;
					case '2': value[i] = 2; break;
				}
			}
	
			if (value[0] > value[1])
				return cards;
			else if (value[0] < value[1])
				return [cards[1], cards[0]];
			
			for (var i = 0; i < 2; i++) {
				switch(cards[i].charAt(1)) {
					case 's': value[i] = 3; break;
					case 'h': value[i] = 2; break;
					case 'd': value[i] = 1; break;
					case 'c': value[i] = 0; break;
				}
			}
	
			if (value[0] > value[1])
				return cards;
			else if (value[0] < value[1])
				return [cards[1], cards[0]];
		}

		static StringToFloat(string) {
			return parseFloat(string.toString().replace(/,/,''));
		}
	}
	
	class HandRecord {
		constructor() {
			this.cards;		// simple form
			this.bets = [0,0,0,0];
			this.folded = RIVER + 1; // Start out assuming they don't fold
			this.result; 	// Profit/loss
		}
	
		deal(cards) {
			this.cards = cards;
		}
	
		bet(state, amount) {
			this.bets[state] = amount;
		}
	
		fold(state) {
			this.folded = state; // Use a bet of -1 as indication of a fold
		}
	
		setResult(win, totalPot) {
			if (win)
				this.result = totalPot;
			else {
				var losses = 0;
				for (var i = 0; i < this.bets.length; i++) { losses += this.bets[i] }
				this.result = -1 * losses;
			}
		}
	}
	
	// Function to add a mutation observer to an object
	var observeDOM = (function(){
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
	
		return function(obj, mutationslist, callback){
			if( MutationObserver ){
				// define a new observer
				var obs = new MutationObserver(callback);
				
				// have the observer observe foo for changes in children
				obs.observe( obj, mutationslist);
			}
		};
	})();

	class Player {
		constructor() {
			this.reset();
		}

		reset() {
			this.name = "";
			this.position = -1;
			this.balance = -1;
			this.cards = [];
			this.lastAction = VOID_BET;
			this.currHandRecord = new HandRecord();
			this.playerRecord = new PlayerRecord();
		}
	}
	
	class PlayerRecord {
		constructor() {
			this.winRate = 0;
			this.avgBet = [0,0,0,0]; // Preflop, flop, turn, river
			this.seen = [0,0,0,0]; // Flops, turns, rivers, show cards
			this.handRecords = [];
		}

		averageBet(state, numHands) {
			if (this.handRecords.length === 0)
				return 0;

			if (!numHands)
				numHands = this.handRecords.length;

			var total = 0;
			for (var i = this.handRecords.length - numHands; i < this.handRecords.length; i++) {
				var record = this.handRecords[i];
				if (record.folded <= state) { // Make sure they didn't fold before or during this state
					numHands--;
					continue;
				}

				total += Util.StringToFloat(record.bets[state]);
			}

			return total / numHands;
		}

		averageBetSummary(numHands) {
			var output = parseFloat(Math.round(this.averageBet(PREFLOP, numHands) * 100) / 100).toFixed(2);
			for (var i = FLOP; i <= RIVER; i++) {
				output += " " + parseFloat(Math.round(this.averageBet(i, numHands) * 100) / 100).toFixed(2);
				
			}
			return output;
		}

		betPercentage(state, numHands) {
			if (this.handRecords.length === 0)
				return 0;

			if (!numHands)
				numHands = this.handRecords.length;

			var total = 0;
			for (var i = this.handRecords.length - numHands; i < this.handRecords.length; i++) {
				var record = this.handRecords[i];
				if (record.folded <= state) { // Make sure they didn't fold before or during this state
					numHands--;
					continue;
				}

				total += 1;
			}

			return total / numHands;
		}

		betPercentageSummary(numHands) {
			var output = parseFloat(Math.round(this.averageBet(PREFLOP, numHands) * 100)).toFixed(2);
			for (var i = FLOP; i <= RIVER; i++) {
				output += " " + parseFloat(Math.round(this.averageBet(i, numHands) * 100) / 100).toFixed(2);
				
			}
			return output;

			var fold = [parseFloat(Math.round(this.foldPercentage(PREFLOP, numHands) * 100))];
			for (var i = FLOP; i <= RIVER; i++) {
				fold[i] = fold[i-1] + parseFloat(Math.round(this.foldPercentage(i, numHands) * 100));
			}	

			var output = fold[PREFLOP].toFixed(0);
			for (var i = FLOP; i <= RIVER; i++) {
				output += " " + fold[i].toFixed(0); // Creates a string while summing cumulative fold percentages
			}

			return output;
		}

		foldPercentage(state, numHands) {
			if (this.handRecords.length === 0)
			return 0;

			if (!numHands)
				numHands = this.handRecords.length;

			var total = 0;
			for (var i = this.handRecords.length - numHands; i < this.handRecords.length; i++) {
				var record = this.handRecords[i];
				if (record.folded === state) // Make sure they didn't fold before or during this state
					total += 1;
			}

			return total / numHands;
		}

		foldPercentageSummary(numHands) {
			var fold = [parseFloat(Math.round(this.foldPercentage(PREFLOP, numHands) * 100))];
			for (var i = FLOP; i <= RIVER; i++) {
				fold[i] = fold[i-1] + parseFloat(Math.round(this.foldPercentage(i, numHands) * 100));
			}	

			var output = fold[PREFLOP].toFixed(0);
			for (var i = FLOP; i <= RIVER; i++) {
				output += " " + fold[i].toFixed(0); // Creates a string while summing cumulative fold percentages
			}

			return output;
		}
	}

	class Settings {
		constructor() {
			this.autoFold = true;
			this.blockInput = true;
		}
	}

	class TableController {
	
		constructor() {
			this.tableRecord;
	
			this.ante;
			this.smallBlind;
			this.bigBlind;
			this.numSeats = 0;
			this.seat = [];
			this.mySeat = new Player();

			this.communityCards = [];
			this.state;
			this.started = false;
			this.recording = true;

			this.turnActions = { check:false, bet:false, raise:false, fold:false, call:false };
			this.paused = true;			

			console.log("Starting");
	
			tableViewContainer = new TableViewContainer(document.getElementsByClassName("table-view-container")[0]);

		}

		getSeat(number) {
			if (number === -1) { // Local player seat
				return this.mySeat;
			}
			else
				return this.seat[number];
		}

		pause() {
			this.paused = true;
		}

		run() {
			this.paused = false;
		}

		startHand() {
			if (this.started)
				return;

			// Signal that we have started a hand
			this.started = true;
			console.log("HAND STARTED");
			
			// Clear out any prevous cards
			for (var i = -1; i < this.seat.length; i++) {
				this.getSeat(i).cards = [];
			}
			
		}

		startMyTurn() {
			if (this.paused) // Do nothing if paused
				return;

			if (settings.autoFold) {
				if (!this.shouldFold)
					ui.callAttention();
				else {
					// We need to check if possible, otherwise fold
					if (this.turnActions.check) {
						setTimeout(function() {
							if (tableController.paused)
								return;

							if (Util.canPlay(myPlayerSeat.parseCards(), 1)) {
								console.log("MISTAKEN HAND!!!!");
								ui.callAttention();
								return;
							}
	
							console.log("CHECKING");
							userActions.checkButton.click();
						}, Math.random() * 2000 + 600);
					}
					else if (this.turnActions.fold) {
						setTimeout(function() {
							if (tableController.paused)
								return;

							if (Util.canPlay(myPlayerSeat.parseCards(), 1)) {
								console.log("MISTAKEN HAND!!!!");
								ui.callAttention();
								return;
							}

							console.log("FOLDING");
							userActions.foldButton.click();
						}, Math.random() * 2000 + 600);
					}
					else {
						// Otherwise we don't know what's going on, better get the user's attention
						console.log("UNSURE OF ACTION");
						ui.callAttention();
					}
				}
			}

		}

		endMyTurn() {


			// Clear out the previous options
			for(var action in this.turnActions) { this.turnActions[action] = false; };

			if (this.paused)
				return;

			
		}

		endHand() {
			if (!this.started) {
				console.log("NOT STARTED");
				return;
			}

			this.started = false;
			console.log("HAND ENDING");

			// TODO: get the winners and pot amounts

			// Hand Record
			for (var i = 0; i < this.seat.length; i++) {
				var seat = this.seat[i];
				if (seat.playing) {
					seat.playerRecord.handRecords.push(seat.currHandRecord); // Record this hand
					seat.currHandRecord = new HandRecord();				// Reset the temp record
					ui.updatePlayerInfo(seat.position, [seat.playerRecord.averageBetSummary(), seat.playerRecord.foldPercentageSummary()]);
					seat.playing = false;
				}
			}

		}

		addCard(number, card) {
			if (!this.started) 
				return;

			var seat = this.getSeat(number);

			if (seat.cards.length < 2) // Don't add duplicates, assumes the cards come in order before duplicates
				seat.cards.push(card);

			// Check my cards
			if (number === -1 && seat.cards.length === 2) {
				if (Util.canPlay(seat.cards, 1))
					this.shouldFold = false;
				else
					this.shouldFold = true;
			}	

			if (seat.cards.length === 2)
				console.log(seat.name + ": " + seat.cards);

			// BOT
			if (this.paused)
				return;

			if (this.shouldFold === false)
				ui.callAttention();
		}

		updateCommunityCards(cards) {
			if (cards !== "")
				this.communityCards.push(cards);
			else {
				this.communityCards = [];
				this.endHand();
			}

			switch (this.communityCards.length) {
			case 0:
				this.state = PREFLOP;	
			break;
			case 1:
			case 2:
			case 3:
				this.state = FLOP;
			break;
			case 4:
				this.state = TURN;
			break;
			case 5:
				this.state = RIVER;
			break;
			}
			
			//console.log(this.state);
		}

		updateHand(number, action, value) {
			if (action === ENTRY_BET || action === SMALL_BLIND || action === DEAD_BIG_BLIND || action === DEAD_SMALL_BLIND || action === BB_DEAD_SMALL) 
				this.startHand();
			else if (!this.started)
				return;

			// Get the proper seat
			var seat = this.getSeat(number);

			seat.lastAction = action;
			
			// RECORDS
			if (this.recording) {

				// Hand Record
				switch (action) {
					case FOLD: seat.currHandRecord.fold(this.state); break;
					default: seat.currHandRecord.bet(this.state, value);
				}


				// Table Record
				// TODO
			}

			console.log(seat.name + ": " + action + " " + value);
		}

		addTurnAction(action) {
			switch (action) {
				case CHECK: this.turnActions.check = true; 	break;
				case FOLD: 	this.turnActions.fold = true; 	break;
				case RAISE: this.turnActions.raise = true;	break;
				case BET: 	this.turnActions.bet = true; 	break;	
				case CALL: 	this.turnActions.call = true; 	break;
			}
		}

		setNumSeats(numSeats) {
			this.numSeats = numSeats;

			for (var i = 0; i < this.numSeats; i++) {
				this.seat.push(new Player());
			}
		}

		fillSeat(number, playerName) {
			var seat = this.getSeat(number);

			seat.name = playerName;
		}

		emptySeat(number) {
			if (number === -1) // Don't empty our seat
				return;

			this.getSeat(number).reset();
			ui.updatePlayerInfo(number, []);
		}

	}

	class UI {
		constructor(settings) {
			this.isShown = false;
			this.tableContainer = document.getElementsByClassName("table-container")[0];
			this.menuParent = document.getElementsByClassName("own-player")[0];
			this.backupTop = this.menuParent.style.top;

			// Create elements
			this.container = document.createElement("div");

			// Menu option container
			var optionContainer = document.createElement("div");
			optionContainer.setAttribute("class", "inject-menu-option");

			// Autofold checkbox
			this.autoFold = document.createElement('input');
			this.autoFold.type = "checkbox";
			this.autoFold.id = "inject-autofold-checkbox";
			this.autoFold.checked = settings.autoFold;
			this.autoFold.setAttribute("class", "checkbox inject-checkbox");
			this.autoFold.addEventListener('change', function() {
				if(this.checked) {
					settings.autoFold = true;
				} else {
					settings.autoFold = false;
				}
			});

			// Autofold checkbox label
			var label = document.createElement('label');
			label.htmlFor = "inject-autofold-checkbox";
			label.setAttribute("class", "checkbox-icon-label");
			label.appendChild(document.createTextNode(" Auto Fold"));

			optionContainer.appendChild(this.autoFold);
			optionContainer.appendChild(label);
			this.container.appendChild(optionContainer);
			this.menuParent.appendChild(this.container);


			// Menu option container
			var optionContainer = document.createElement("div");
			optionContainer.setAttribute("class", "inject-menu-option");

			// Block input checkbox
			this.blockInput = document.createElement('input');
			this.blockInput.type = "checkbox";
			this.blockInput.id = "inject-block-input-checkbox";
			this.blockInput.checked = settings.blockInput;
			this.blockInput.setAttribute("class", "checkbox inject-checkbox");
			this.blockInput.addEventListener('change', function() {
				if(this.checked) {
					settings.blockInput = true;
				} else {
					settings.blockInput = false;
				}
			});

			// Block input checkbox label
			var label = document.createElement('label');
			label.htmlFor = "inject-block-input-checkbox";
			label.setAttribute("class", "checkbox-icon-label");
			label.appendChild(document.createTextNode(" Block Input"));

			optionContainer.appendChild(this.blockInput);
			optionContainer.appendChild(label);
			this.container.appendChild(optionContainer);
			this.menuParent.appendChild(this.container);

			// Run/Pause button
			this.runButton = document.createElement("div");
			this.runButton.id = "inject-run-button";
			this.runButton.setAttribute("class", "action-button inject-run-button show");
			this.runButton.addEventListener('click', function() {
				if (this.classList.contains("inject-pause-button")) {
					ui.pause();
				} else {
					ui.run();
				}
			});

			// Run/Pause button text
			this.runButtonText = document.createElement("span");
			this.runButtonText.innerHTML = "Run";
			this.runButtonText.setAttribute("class", "text");

			this.runButton.appendChild(this.runButtonText);
			this.tableContainer.appendChild(this.runButton);

			// Information Button
			this.infoButton = document.createElement("div");
			this.infoButton.id = "inject-info-button";
			this.infoButton.setAttribute("class", "action-button inject-info-button show");
			this.infoButton.addEventListener('click', function() {
				ui.togglePlayerInfo();
				//ui.showInformationOverlay();
			});

			// Information Button : text
			var text = document.createElement("span");
			text.innerHTML = "i";
			text.setAttribute("class", "text");
			text.style.fontWeight = 900;

			//this.infoButton.appendChild(text);
			this.tableContainer.appendChild(this.infoButton);

			// Information overlay
			this.informationOverlay = document.createElement("div");
			this.informationOverlay.setAttribute("class", "inject-information-overlay");

			// Information overlay : close button
			var button = document.createElement("div");
			button.setAttribute("class", "inject-close");
			button.addEventListener("click", function() {
				this.parentElement.style.display = "none";
			});

			this.informationOverlay.appendChild(button);
			//document.getElementsByTagName("BODY")[0].appendChild(this.informationOverlay);

			// Player info
			this.playerInfo = [,,,,,,,,,];
			for (var i = 0; i < this.playerInfo.length; i++) {
				this.playerInfo[i] = document.createElement("div");
				this.playerInfo[i].setAttribute("class", "inject-player-info seat-pos-" + i);
				defaultPokerTable.element.appendChild(this.playerInfo[i]);
			}

			this.show();
		}

		updatePlayerInfo(position, info) { // Takes array of strings, each will be seperated by a line break
			var playerInfo = this.playerInfo[position];
			while (playerInfo.firstChild) { playerInfo.removeChild(playerInfo.firstChild) }

			if (!info)
				return;

			for (var i = 0; i < info.length; i++) {
				var span = document.createElement("span");
				span.innerText = info[i];
				playerInfo.appendChild(span);
			}
		}

		togglePlayerInfo() {
			var display = "none";
			if (this.playerInfo[0].style.display === "none")
				display = "";

			for (var i = 0; i < this.playerInfo.length; i++) {
				this.playerInfo[i].style.display = display;
			}
		}

		pause() {
			console.log("Paused");
			this.runButton.classList.remove("inject-pause-button");
			this.runButtonText.innerHTML = "Run";

			this.stopBlocking();

			tableController.pause();
		}

		run() {
			console.log("Running");
			this.runButton.classList.add("inject-pause-button");
			this.runButtonText.innerHTML = "Pause";

			if (settings.blockInput)
				this.block();

			tableController.run();
		}

		showInformationOverlay() {
			this.informationOverlay.style.display = "";
		}

		block() {
			if (this.isBlocking)
				return;
			
			// Create elements
			var blockOverlay = document.createElement("div");
			blockOverlay.addEventListener("click", function() {
				ui.pause();
			});
			var takeoverText = document.createElement("span");
			takeoverText.innerHTML = "Click to takeover";
			
			// Add CSS
			blockOverlay.setAttribute("class", "inject-block-input");
			takeoverText.setAttribute("class", "inject-text-takeover");

			// Append to page
			blockOverlay.appendChild(takeoverText);                 
			document.getElementsByTagName("BODY")[0].appendChild(blockOverlay); // Append the overlay and it's text to the table container
			this.isBlocking = true;
		}

		stopBlocking() {
			if (!this.isBlocking)
				return;

			var blockOverlay = document.getElementsByClassName("inject-block-input")[0];
			blockOverlay.parentElement.removeChild(blockOverlay);
			this.isBlocking = false;
		}

		callAttention() {
			this.block();

			var blockOverlay = document.getElementsByClassName("inject-block-input")[0];
			blockOverlay.classList.add("inject-call-attention");
		}

		show() {
			if (this.isShown)
				return;
		
			this.menuParent.style.top = "73%";
			this.container.removeAttribute("style");
			
			this.isShown = true;
		}

		hide() {
			if (!this.isShown)
				return;

			this.menuParent.style.top = this.backupTop;
			this.container.setAttribute("style", "display:none");

			this.isShown = false;
		}

	}
	
	class TableViewContainer {	
	
		constructor(tvc) {
			this.element = tvc;
			//this.tableContainer;
		
			// Set callback to detect loading of the game container
			observeDOM(this.element, { childList:true, subtree:true }, this.callback);
		}
	
		// Only used to detect when the table-container is loaded, then disconnects
		callback(mutations, observer) {
			mutations.forEach(function(mutation) {
				switch (mutation.type) {
					case "childList":
						mutation.addedNodes.forEach(function(addedNode) {					
							if (addedNode.nodeType == 1) {
								if (addedNode.classList.contains("table-container")) {
									console.log(addedNode);
									tableContainer = new TableContainer(addedNode);
									ui = new UI(settings);
									observer.disconnect();
								}
							}
						})
					break;
				}		
			}); 
		}
	}
	
	class TableContainer {
		constructor (tc) {
			this.element = tc;
			//this.userActions;
			//this.canvasProgressBar
			//this.defaultPokerTable;

			
			this.parseTableContainer();
		}

		parseTableContainer() {
			for (var i = 0; i < this.element.children.length; i++) {
				var child = this.element.children[i];
				
				if (child.classList.contains("default-poker-table")) {
					defaultPokerTable = new DefaultPokerTable(child);
				}
				else if (child.classList.contains("user-actions")) {
					userActions = new UserActions(child);
				}
				else if (child.classList.contains("canvas-progress-bar")) {
					canvasProgressBar = new CanvasProgressBar(child);
				}
			}
		}
	}

	class UserActions {
		constructor(ua) {
			this.element = ua;

			// Get the elements for calling later
			this.foldButton;
			this.callButton;
			this.raiseButton;
			this.betButton;
			this.checkButton;

			this.parseUserActions();

			this.callback = this.callback(this);
			observeDOM(this.element, { childList:true, subtree:true, attributes:true }, this.callback);
		}

		parseUserActions() {
			for(var i = 0; i < this.element.children.length; i++) {
				var child = this.element.children[i];

				if (child.classList.contains("action-fold")) this.foldButton = child;
				else if (child.classList.contains("action-call")) this.callButton = child;
				else if (child.classList.contains("action-raise")) this.raiseButton = child;
				else if (child.classList.contains("action-bet")) this.betButton = child;
				else if (child.classList.contains("action-check")) this.checkButton = child;


			}
		}

		callback(ua) {

			return function(mutations, observer) {			
	
				mutations.forEach(function(mutation) {
					switch (mutation.type) {
						case "attributes":
						//console.log("UserAction: Attributes");
						//console.log(mutation);

						var changedNode = mutation.target;

						
						if (changedNode.classList.contains("action-check")) {
							if (changedNode.classList.contains("show")) {
								tableController.addTurnAction(CHECK);
							}
							
						}
						else if (changedNode.classList.contains("action-fold")) {
							if (changedNode.classList.contains("show")) {
								tableController.addTurnAction(FOLD);
							}
						}
						else if (changedNode.classList.contains("action-raise")) {
							if (changedNode.classList.contains("show")) {
								tableController.addTurnAction(RAISE);
							}
						}
						else if (changedNode.classList.contains("action-bet")) {
							if (changedNode.classList.contains("show")) {
								tableController.addTurnAction(BET);
							}
						}
						else if (changedNode.classList.contains("action-call")) {
							if (changedNode.classList.contains("show")) {
								tableController.addTurnAction(CALL);
							}
						}

						// TODO: tons more actions to include...
						break;
						case "childList":
						//console.log("UserAction: ChildList");
						//console.log(mutation);
							mutation.addedNodes.forEach(function(addedNode) {
								switch (addedNode.nodeType) {
									
								case 1: // ELEMENT_NODE
									
									
								break;
		
								case 3: // TEXT_NODE
									parent = addedNode.parentElement;
									//console.log(addedNode.nodeValue);
									if (!parent)
										break;
	
									
								break;
								}
							})
							mutation.removedNodes.forEach(function(removedNode) {
								switch (removedNode.nodeType) {
								case 1: // ELEMENT_NODE
								break;
								case 3: // TEXT_NODE
								break;	
								}
							})
						break;
					}
				});
			};
		}
	}

	class CanvasProgressBar {
		constructor(cpb) {
			this.element = cpb;

			this.started = true;

			this.callback = this.callback(this);
			observeDOM(this.element, { attributes:true }, this.callback);
		}

		callback(cpb) {

			return function(mutations, observer) {			
	
				mutations.forEach(function(mutation) {
					switch (mutation.type) {
						case "attributes":						
						var changedNode = mutation.target;

						if (changedNode.style.display === "none") {
							if (cpb.started) {
								tableController.endMyTurn();
								cpb.started = false;
							}
						}
						else if (!cpb.started) {
							tableController.startMyTurn();
							cpb.started = true;
						}
						break;

					}
				});
			};
		}
	}
	
	class DefaultPokerTable {
		
		constructor(dpt) {
			this.element = dpt;
			//this.seat = [,,,,,,,,];
			//this.myPlayerSeat;
			this.tableInfo;
			//this.communityCards;
			//this.mainPot;
			
			

			this.parseDefaultPokerTable();
			this.parseTableInfo(this.tableInfo);
			this.parseCommunityCards(communityCards);

			//observeDOM(this.tableInfo, { childList:true, subtree:true, attributes:true, characterData:true }, tableInfoCallback);
			observeDOM(communityCards, { childList:true }, this.communityCardsCallback);

		}

		parseDefaultPokerTable() {

			if (this.element.classList.contains("table-4")) 
				tableController.setNumSeats(4);
			else if (this.element.classList.contains("table-6")) 
				tableController.setNumSeats(6);
			else if (this.element.classList.contains("table-9")) 
				tableController.setNumSeats(9);
			else
				console.log("ERROR NUMSEATS: "); console.log(this.element);

			for (var i = 0; i < this.element.children.length; i++) {
				var child = this.element.children[i];
				
				if (child.classList.contains("seat-pos-0")) { seat[0] = new Seat(child, 0); }
				else if (child.classList.contains("seat-pos-1")) { seat[1] = new Seat(child, 1); }
				else if (child.classList.contains("seat-pos-2")) { seat[2] = new Seat(child, 2); }
				else if (child.classList.contains("seat-pos-3")) { seat[3] = new Seat(child, 3); }
				else if (child.classList.contains("seat-pos-4")) { seat[4] = new Seat(child, 4); }
				else if (child.classList.contains("seat-pos-5")) { seat[5] = new Seat(child, 5); }
				else if (child.classList.contains("seat-pos-6")) { seat[6] = new Seat(child, 6); }
				else if (child.classList.contains("seat-pos-7")) { seat[7] = new Seat(child, 7); }
				else if (child.classList.contains("seat-pos-8")) { seat[8] = new Seat(child, 8); }
				else if (child.classList.contains("my-player-seat")) { myPlayerSeat = new MyPlayerSeat(child); }
				else if (child.classList.contains("table-info")) { this.tableInfo = child; }
				else if (child.classList.contains("community-cards")) { communityCards = child; }
				else if (child.classList.contains("main-pot")) { mainPot = child; }
			}
		}

		parseTableInfo(tableInfo) {
			console.log(tableInfo);
			for(var i = 0; i < tableInfo.children.length; i++) {
				var child = tableInfo.children[i];

				if (child.classList.contains("blinds normal")) {
					if (child.style.display !== "none") {
						tableController.smallBlind = 0;
						tableController.bigBlind = 0;
					}	
					else {
						for(var i2 = 0; i2 < child.children.length; i2++) {
							var child2 = child.children[i];

							if (child2.classList.contains("table-blinds-value")) {
								var blinds = child2.innerText().split("/");
								tableController.smallBlind = blinds[0];
								tableController.bigBlind = blinds[1];
							}
						}
					}
				}
				else if (child.classList.contains("blinds ante")) {
					if (child.style.display !== "none") {
						tableController.ante = 0;
					}	
					else {
						for(var i2 = 0; i2 < child.children.length; i2++) {
							var child2 = child.children[i];
							if (child2.classList.contains("table-blinds-value")) {
								tableController.ante = child2.innerText();
							}
						}
					}
				}
				//else if (child.classList.contains("blinds normal") && child.style.display !== "none") {}
			}
		}

		/*tableInfoCallback(mutations, observer) {
			mutations.forEach(function(mutation) {
				switch (mutation.type) {
					case "attributes":
					break;
					case "characterData":
					break;
					case "childList":
						mutation.addedNodes.forEach(function(addedNode) {					
							if (addedNode.nodeType == 1) {
								//console.log(addedNode);
							}
						})
						mutation.removedNodes.forEach(function(removedNode) {
							if (removedNode.nodeType == 1) {
								//console.log(removedNode);
							}
						})
					break;
				}		
			}); 
		}*/

		parseCommunityCards(communityCards) {
			if (communityCards.children.length === 0) {
				tableController.updateCommunityCards("");
				return;
			}

			for(var i = 0; i < communityCards.children.length; i++) {
				cardContainer = communityCards.children[i];

				tableController.updateCommunityCards(cardContainer.children[0].alt);
			}
		}

		communityCardsCallback(mutations, observer) {
			mutations.forEach(function(mutation) {
				var parent = mutation.target.parentElement;

				mutation.addedNodes.forEach(function(addedNode) {					
					if (addedNode.nodeType === 1) {
						tableController.updateCommunityCards(addedNode.children[0].alt);
					}
				});
				mutation.removedNodes.forEach(function(removedNode) {
					if (removedNode.nodeType === 1) {
						tableController.updateCommunityCards("");
					}
				});
			}); 
		}
		
	}


	
	class Seat {
	
		constructor(seat, number) {
			this.element = seat;
			//this.position = 0; 				// seat-pos-#  from seat attributes
			//this.seatText; 					// seat-text
				//this.playerName; 					// player-name
				//this.seatBalance; 				// seat-balance
			//this.cardsContainer;				// cards-container
				//this.playerCardBox = [,]; 		// player-card-box, player-card-box
					//this.number = [,]; 				// number-1, number-2
			//this.playerStatus;				// player-status
			//this.actionText;					// action-text
			//this.actionAmount;				// action-amount
				//this.value						// value - contains a <span> with the amount
			//this.handStrength;				// hand-strength

			this.number = number;
			this.reset();
			this.parseSeat();

			// Don't set a call back if this seat doesn't fit at the table
			if (this.number >= tableController.numSeats)
				return;

			// Set the callback
			this.callback = this.callback(this);
			observeDOM(this.element, { childList:true, subtree:true, attributes:true, characterData:true }, this.callback);
		}
	
		reset() {
			// Local variables for data interpretation
			this.playerLoaded = 0;
			this.lastAction = VOID_BET;
			this.actionQueue = [];
		}
	
		parseSeat() {
			if (!this.element.classList.contains("empty-seat")) {
				for (var i = 0; i < this.element.children.length; i++) {
					var child = this.element.children[i];

					if (child.classList.contains("seat-text")) {
						this.playerLoaded += 1;

						if (this.playerLoaded === 1) {
							tableController.fillSeat(this.number, child.children[0].innerText.trim());
							tableController.getSeat(this.number).balance = parseFloat(child.children[1].innerText);
						}
					}
					// action-text   action-amount   could be updated but we will just ignore everything until a new hand starts and record via the callback
				}

				if (this.element.classList.contains("seat-pos-0")) { tableController.seat[this.number].position = 0; }
				else if (this.element.classList.contains("seat-pos-1")) { tableController.seat[this.number].position = 1; }
				else if (this.element.classList.contains("seat-pos-2")) { tableController.seat[this.number].position = 2; }
				else if (this.element.classList.contains("seat-pos-3")) { tableController.seat[this.number].position = 3; }
				else if (this.element.classList.contains("seat-pos-4")) { tableController.seat[this.number].position = 4; }
				else if (this.element.classList.contains("seat-pos-5")) { tableController.seat[this.number].position = 5; }
				else if (this.element.classList.contains("seat-pos-6")) { tableController.seat[this.number].position = 6; }
				else if (this.element.classList.contains("seat-pos-7")) { tableController.seat[this.number].position = 7; }
				else if (this.element.classList.contains("seat-pos-8")) { tableController.seat[this.number].position = 8; }
			}
		}

		callback(s) {

			return function(mutations, observer) {			
	
				mutations.forEach(function(mutation) {
					//console.log("------------------------------------------------------------------------------");
					switch (mutation.type) {
						case "attributes":
							var changedNode = mutation.target;
							
							if (changedNode.classList.contains("hand-strength")) {
								if (changedNode.classList.contains("won")) {
									// TODO: add this to results and get the pot divisions
								}

							}
							else if (changedNode === s.element) {
								if (changedNode.classList.contains("seat-empty")) {
									tableController.emptySeat(s.number);
									break;
								}
							
								if (changedNode.classList.contains("seat-pos-0")) { tableController.seat[s.number].position = 0; }
								else if (changedNode.classList.contains("seat-pos-1")) { tableController.seat[s.number].position = 1; }
								else if (changedNode.classList.contains("seat-pos-2")) { tableController.seat[s.number].position = 2; }
								else if (changedNode.classList.contains("seat-pos-3")) { tableController.seat[s.number].position = 3; }
								else if (changedNode.classList.contains("seat-pos-4")) { tableController.seat[s.number].position = 4; }
								else if (changedNode.classList.contains("seat-pos-5")) { tableController.seat[s.number].position = 5; }
								else if (changedNode.classList.contains("seat-pos-6")) { tableController.seat[s.number].position = 6; }
								else if (changedNode.classList.contains("seat-pos-7")) { tableController.seat[s.number].position = 7; }
								else if (changedNode.classList.contains("seat-pos-8")) { tableController.seat[s.number].position = 8; }
							}
							else if (mutation.attributeName === "src" && changedNode.classList.contains("number-1") || changedNode.classList.contains("number-2")) {
								var srcURL = changedNode.src;
								tableController.addCard(s.number, srcURL.match(/..(?=[.]svg)/));
							}
						break;
						case "characterData":
						//console.log(mutation);
						break;
						case "childList":
							mutation.addedNodes.forEach(function(addedNode) {
								//console.log("MyPlayerSeat: Node Added");		
								//console.log(addedNode);
	
								switch (addedNode.nodeType) {
									
								case 1: // ELEMENT_NODE
									if (addedNode.classList.contains("player-card-box")) {
										tableController.getSeat(s.number).playing = true;
									}	
									else if (addedNode.classList.contains("value")) {
										var action;
										if (s.actionQueue.length > 0) {
											action = s.actionQueue[0];
											s.actionQueue.splice(0, 1);
										}
										else {
											if (s.lastAction === VOID_BET)
												action = ENTRY_BET;
											else
												return; // Prevents an incorrect entry bet when checking the big blind
										}
										
										s.lastAction = action;
										tableController.updateHand(s.number, action, addedNode.children[0].innerText);
									}
									else if (addedNode.classList.contains("seat-text")) {
										s.playerLoaded += 1;

										if (s.playerLoaded === 1) {
											tableController.fillSeat(s.number, addedNode.children[0].innerText.trim());
											tableController.getSeat(s.number).balance = parseFloat(addedNode.children[1].innerText);
										}
									}
								break;
		
								case 3: // TEXT_NODE
									parent = addedNode.parentElement;
									//console.log(addedNode.nodeValue);
									if (!parent)
										break;
	
									if (parent.classList.contains("action-text")) {
										switch (addedNode.nodeValue) {
											case "Dead Small Blind": s.actionQueue.push(DEAD_SMALL_BLIND); break;
											case "Dead Big Blind": s.actionQueue.push(DEAD_BIG_BLIND); break;
											case "BB + Dead Small": s.actionQueue.push(BB_DEAD_SMALL); break;
											case "Small Blind": s.actionQueue.push(SMALL_BLIND); break;
											case "Big Blind": s.actionQueue.push(BIG_BLIND); break;
											//case "Muck": tableController.updateHand(s.number, MUCK, 0); break;
											case "Call": s.actionQueue.push(CALL); break;
											case "Bet": s.actionQueue.push(BET); break;
											case "Raise": s.actionQueue.push(RAISE); break;
											case "Check": 
											tableController.updateHand(s.number, CHECK, 0); 
											s.lastAction = CHECK; 
											break;
											case "Fold": 
											tableController.updateHand(s.number, FOLD, 0); 
											s.lastAction = FOLD; 
											break;
											default: console.log("MISSING ACTION: " + addedNode.nodeValue);
										}
	
									}
									else if (parent.classList.contains("seat-balance")) {
										tableController.getSeat(s.number).balance = parseFloat(addedNode.nodeValue);
									}
									else if (parent.classList.contains("player-status")) {
	
									}
									else if (parent.classList.contains("hand-strength")) {
	
									}
								break;
								}
							})
							mutation.removedNodes.forEach(function(removedNode) {
								//console.log("MyPlayerSeat: Node Removed");
								//console.log(removedNode);
								switch (removedNode.nodeType) {
								case 1: // ELEMENT_NODE
									if (removedNode.classList.contains("seat-text")) {
										s.playerLoaded -= 1;

										if (s.playerLoaded <= 0) {
											s.reset(); // Reset the player because they left
											tableController.emptySeat(s.number);
										}
									}
								break;
								case 3: // TEXT_NODE
								break;	
								}
							})
						break;
					}
				});
			};
		}
	
	}
	
	class MyPlayerSeat {
	
		constructor(mps) {
			this.element = mps;
			//this.position = 0; 				// seat-pos-#  from seat attributes
			//this.seatText; 					// seat-text
				//this.playerName; 					// player-name
				//this.seatBalance; 				// seat-balance
			//this.cardsContainer;				// cards-container
				//this.playerCardBox = [,]; 		// player-card-box, player-card-box
					//this.number = [,]; 				// number-1, number-2
			//this.playerStatus;				// player-status
			//this.actionText;					// action-text
			//this.actionAmount;				// action-amount
				//this.value						// value - contains a <span> with the amount
			//this.handStrength;				// hand-strength

			
			this.number = -1;
			this.reset();

			// Set the callback
			this.callback = this.callback(this);
			observeDOM(this.element, { childList:true, subtree:true, attributes:true, characterData:true }, this.callback);
		}

		reset() {
			// Local variables for data interpretation
			this.playerLoaded = 0;
			this.lastAction = VOID_BET;
			this.actionQueue = [];
			tableController.getSeat(this.number).position = 0;
		}

		parseCards() {
			// Get and store the cards-container element
			if (!this.cardsContainer) {
				for (var i = 0; i < this.element.children.length; i++) {
					var child = this.element.children[i];

					if (child.classList.contains("cards-container"))
						this.cardsContainer = child;
				}
			}

			if (!this.cardsContainer)
				return;
			
			// Parse the cards from the container
			var cards = [,];
			for (var i = 0; i < this.cardsContainer.children.length; i++) {
				var child = this.cardsContainer.children[i];

				if (child.classList.contains("player-card-box")) {
					var imgContainer = child.children[0];
	
					if (imgContainer.classList.contains("number-1")) {
						cards[0] = imgContainer.alt;
					}
					else if (imgContainer.classList.contains("number-2")) {
						cards[1] = imgContainer.alt;
					}
				}
			}

			console.log("ParseCards: " + cards[0] + " " + cards[1]);

			return cards;
		}
	
		callback(s) {

			return function(mutations, observer) {			
	
				mutations.forEach(function(mutation) {
					//console.log("------------------------------------------------------------------------------");
					switch (mutation.type) {
						case "attributes":
						//console.log(mutation);
						break;
						case "characterData":
						//console.log(mutation);
						break;
						case "childList":
							mutation.addedNodes.forEach(function(addedNode) {
								//console.log("MyPlayerSeat: Node Added");		
								//console.log(addedNode);
	
								switch (addedNode.nodeType) {
									
								case 1: // ELEMENT_NODE
									if (addedNode.classList.contains("player-card-box")) {
										var imgContainer = addedNode.children[0];
	
										if (imgContainer.classList.contains("number-1")) {
											tableController.addCard(s.number, imgContainer.alt);
										}
										else if (imgContainer.classList.contains("number-2")) {
											tableController.addCard(s.number, imgContainer.alt);
										}
									}
									else if (addedNode.classList.contains("value")) {
										var action;
										if (s.actionQueue.length > 0) {
											action = s.actionQueue[0];
											s.actionQueue.splice(0, 1);
										}
										else {
											if (s.lastAction === VOID_BET)
												action = ENTRY_BET;
											else
												return; // Prevents an incorrect entry bet when checking the big blind
										}
										
										s.lastAction = action;
										tableController.updateHand(s.number, action, addedNode.children[0].innerText);
									}
									else if (addedNode.classList.contains("seat-text")) {
										s.playerLoaded += 1;

										if (s.playerLoaded === 1) {
											tableController.fillSeat(s.number, addedNode.children[0].innerText.trim());
											tableController.getSeat(s.number).balance = parseFloat(addedNode.children[1].innerText);
										}
									}
								break;
		
								case 3: // TEXT_NODE
									parent = addedNode.parentElement;
									//console.log(addedNode.nodeValue);
									if (!parent)
										break;
	
									if (parent.classList.contains("action-text")) {
										switch (addedNode.nodeValue) {
											case "Dead Small Blind": s.actionQueue.push(DEAD_SMALL_BLIND); break;
											case "Dead Big Blind": s.actionQueue.push(DEAD_BIG_BLIND); break;
											case "BB + Dead Small": s.actionQueue.push(BB_DEAD_SMALL); break;
											case "Small Blind": s.actionQueue.push(SMALL_BLIND); break;
											case "Big Blind": s.actionQueue.push(BIG_BLIND); break;
											//case "Muck": tableController.updateHand(s.number, MUCK, 0); break;
											case "Call": s.actionQueue.push(CALL); break;
											case "Bet": s.actionQueue.push(BET); break;
											case "Raise": s.actionQueue.push(RAISE); break;
											case "Check": 
											tableController.updateHand(s.number, CHECK, 0); 
											s.lastAction = CHECK; 
											break;
											case "Fold": 
											tableController.updateHand(s.number, FOLD, 0); 
											s.lastAction = FOLD; 
											break;
											default: console.log("MISSING ACTION: " + addedNode.nodeValue);
										}
	
									}
									else if (parent.classList.contains("seat-balance")) {
										tableController.getSeat(s.number).balance = parseFloat(addedNode.nodeValue);
									}
									else if (parent.classList.contains("player-status")) {
	
									}
									else if (parent.classList.contains("hand-strength")) {
	
									}
								break;
								}
							})
							mutation.removedNodes.forEach(function(removedNode) {
								//console.log("MyPlayerSeat: Node Removed");
								//console.log(removedNode);
								switch (removedNode.nodeType) {
								case 1: // ELEMENT_NODE
									if (removedNode.classList.contains("seat-text")) {
										s.playerLoaded -= 1;

										if (s.playerLoaded <= 0) {
											s.reset(); // Reset the player because they left
											tableController.emptySeat(s.number);
										}
									}
								break;
								case 3: // TEXT_NODE
								break;	
								}
							})
						break;
					}
				});
			};
		}
		
	}
	
	
	
	var ui; // User interface
	var settings = new Settings();
	
	// ENTRY POINT - CONSTRUCTOR ADDS CALLBACK TO DETECT GAME LOADING
	var tableController = new TableController();
		var tableViewContainer;
			var tableContainer;
				var userActions;
				var canvasProgressBar;
				var defaultPokerTable;
					var seat = [,,,,,,,,];
					var myPlayerSeat;
					//var tableInfo;
					var communityCards;
					var mainPot;
	
	

	
	
	
	/*console.log("Starting");
	var readyStateCheckInterval = setInterval(
		function() {
			if (document.readyState === "complete") {
				clearInterval(readyStateCheckInterval);
	
				console.log("Page Loaded");
	
				
			}
		}, 10);*/
	
	
	
	
})();