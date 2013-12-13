(function () {

	'use strict';

	/* TODO
	
		* fix images- diff images for diff genotypes
		* update descriptions 
		* fix bull/cow level- then call it quits!
		* reset function (in case end up in a corner by mating wrong parents)
		* re-visit score mechanism- is it the best implementation?
		* fix UI
		* etc...

	*/

	var game = {
		// Initialise the view
		render: function ( template ) {
			game.view = new Ractive({
				el: 'container',
				template: template,
				data: {

					dialog: true


				}
			});

			game.view.on({
				start: function (event, number){
					game.start(number);
				},

				timer: function () {
					game.timer();
				},

				selectFood: function(event, foodItemNumber ){
					game.selectFood( foodItemNumber );
				},

				speedSetting: function (){
					game.speedSetting();
				},

				exercise: function( event ) {
					game.exercise();
				},

				disease: function(){
					game.disease();
				},

				dismiss: function( event ) {
					game.dismiss();
				},

				buyUpgrades: function ( event, number) {
					game.buyUpgrades ( number );
				},

				gameOver: function (){
					game.gameOver();
				},

				playAgain: function (event){ 
					game.reset();
					game.start();
				}
			});
		},

		reset: function () {
			
			game.view.set({


					instructions:true,
					dialogDisease: null,
					endgame: false,
					dialog: false
				
			});
		},

		// Start a new round
		start: function (number) {

			game.reset();


			// shuffle food data
			shuffle(game.food);
		

			//sets/resets initial values for score dashboard. points are 0 unless the player has already played, in which case the total is carried over
			if(typeof game.points ==='undefined'){
			game.points = 0;
			}

			if(typeof game.pointsUpgrade ==='undefined'){
				game.pointsUpgrade = 0;
			}


			game.calories = 0;
			game.timePenalty = 1;


			//set global variables for controlling turn number/time
			//speed upgrade represents speed upgrades the player can get. Also represents initial timer increment of 100 mili secs
			if(typeof game.speedUpgrade === 'undefined'){
			game.speedUpgrade = 100;
			}

			if(typeof game.calorieUpgrade === 'undefined'){
			game.calorieUpgrade = 100;	
			}
	

			function setTurns(number){
				if(number == 1){
					game.turns = 80;
				}else{
					game.turns = 70;
				}
			}
			setTurns(number);
			//timeLimit is the number of seconds per turn
			game.timeLimit = 1;

			//clone disease data
			game.diseases = game.diseaseList.slice();

			//call timer func to start game
			game.timer();


			// create food grid and stat counters
			game.view.set({
				foodGrid: true,
				foodItem1: game.food[0],
				foodItem2: game.food[1],
				foodItem3: game.food[2],
				foodItem4: game.food[3],
				foodItem5: game.food[4],
				foodItem6: game.food[5],
				foodItem7: game.food[6],
				foodItem8: game.food[7],
				foodItem9: game.food[8],
				foodItem10: game.food[9],
				foodItem11: game.food[10],
				foodItem12: game.food[11],
				'stats.points': game.points,
				'stats.calories': game.calories
				
			});

		},

		//timer function. counts up to a set time then resets and starts again- this represents a 'turn' (game.turns tracks these)
		timer: function(){
			var time = 0;

			

			function startTimer(){
				//check there are still turns remaining
				if(game.turns > 0){
					increment();
				}

			function increment(){ 
				//as increment calls itself, check again that there are turns remaining
				if(game.turns > 0){
				setTimeout(function(){
					//this function calculates the speed
						game.speedSetting();
						time++;
						var mins = Math.floor(time/10/60);
						var secs = Math.floor(time/10);
						var tenths = time % 10;
						//resets the view every time game.timeLimit is reached
						if(secs == game.timeLimit) {
							time = 0;
							shuffle(game.food)
									game.view.set({
										foodItem1: game.food[0],
										foodItem2: game.food[1],
										foodItem3: game.food[2],
										foodItem4: game.food[3],
										foodItem5: game.food[4],
										foodItem6: game.food[5],
										foodItem7: game.food[6],
										foodItem8: game.food[7],
										foodItem9: game.food[8],
										foodItem10: game.food[9],
										foodItem11: game.food[10],
										foodItem12: game.food[11]
										});
							game.turns --;
							}
						//makes seconds counter look purty with an extra '0'
						if(secs < 10){
							secs = '0' + secs};

								game.view.set({

									'timer.mins': mins,
									'timer.secs': secs,
									'timer.tenths': tenths,
									turns: game.turns

								});
								//calls itself- the timer keeps going
								increment();
									
							}, game.speed);
									} else {
									//when this function stops, turns are over and the game ends
									game.gameOver();
								}		
							}
						}	
					startTimer();
				},		


		//calculates the game speed, which is passed into the timer function. Putting this in a separate place makes it easier to control this vital func
		speedSetting: function () {
			game.speed = game.speedUpgrade * (1/(1 + Math.sqrt(Math.pow((game.calories/1000),2)))) / game.timePenalty;
			return game.speed;


		},


		// when player clicks a food item, calories and points added, and food item changes.
		selectFood: function ( foodItemNumber ) {
			

			if(game.turns > 0 ){

			game.points += game.food[foodItemNumber-1].points + game.pointsUpgrade;
			game.calories += game.food[foodItemNumber-1].calories;
			if(game.food[foodItemNumber-1].calories > 200){
			var snd = new Audio('assets/sound/bad.mp3');
			snd.play();

			} else {
			var snd = new Audio('assets/sound/good.mp3');
			snd.play();
			}
			game.view.set({
				'stats.points': game.points,
				'stats.calories': game.calories

				});
			game.disease();
			finishedLoading(bufferList);

			}

		},

		//controls the exercise option
		exercise: function () {
		if(game.turns > 0 ){

			game.calories -= game.calorieUpgrade;
			game.view.set('stats.calories', game.calories)
			}
		},

		disease: function() {
			//when player clicks on a food item, this checks to see if calorie count = a disease. last item in array is a dummy one as shift doesn't work if an item is the last in an array

			for(var i=0; i<game.diseases.length; i++){
				if(game.calories >= game.diseases[i].calories){
					var a = game.diseases.shift();
					game.view.set({
						dialogDisease: a
						/*'stats.timePenalty': a.timePenalty, //for troubleshooting - displays timepenalty and last disease name
						'stats.name': game.diseases[0].name*/
					});
					game.timePenalty += a.timePenalty;

				}
			}
			return game.timePenalty;
		},

		//alows player to dismiss notifications on diseases
		dismiss: function() {
			game.view.set('dialogDisease', false);
		},

		//allows players to buy upgrades. first checks for if they have enough points to buy the requested upgrade, and if they do, alters the associated game variable
		buyUpgrades: function ( upgradeNumber ){
		if(game.upgradesList[upgradeNumber-1].cost > game.finalPoints){
			alert("You don't have enough points to buy this upgrade! Keep playing to build up points");
		}else{
			if(game.upgradesList[upgradeNumber-1].affects = 'calories'){
				game.calorieUpgrade += game.upgradesList[upgradeNumber-1].benefit;
				alert("Congratulations! You now burn more calories doing exercise!");
				game.finalPoints -= game.upgradesList[upgradeNumber-1].cost;

					
					if(upgradeNumber==1){
						game.view.set('upgradeOne', false);
					}

					if(upgradeNumber==2){
						game.view.set('upgradeTwo', false);
					}

					if(upgradeNumber==3){
						game.view.set('upgradeThree', false);
					}
			}else{
				if(game.upgradesList[upgradeNumber-1].affects = 'speed'){
				game.speedUpgrade += game.upgradesList[upgradeNumber-1].benefit;
				alert("Congratulations! You're healther so you have more time per year to enjoy life!");
				game.finalPoints -= game.upgradesList[upgradeNumber-1].cost;
					if(upgradeNumber==1){
						game.view.set('upgradeOne', false);
					}

					if(upgradeNumber==2){
						game.view.set('upgradeTwo', false);
					}

					if(upgradeNumber==3){
						game.view.set('upgradeThree', false);
					}
				}
			 else{
				if(game.upgradesList[upgradeNumber-1].affects = 'points'){
				game.pointsUpgrade += game.upgradesList[upgradeNumber-1].benefit;
				alert("Congratulations! You get more points per food item.");
				game.finalPoints -= game.upgradesList[upgradeNumber-1].cost;
					if(upgradeNumber==1){
						game.view.set('upgradeOne', false);
					}

					if(upgradeNumber==2){
						game.view.set('upgradeTwo', false);
					}

					if(upgradeNumber==3){
						game.view.set('upgradeThree', false);
					}
				}
			}
		}
	}


		},

		winGame: function () {
			// offspring are correct - won the game
			var snd = new Audio('assets/nature/correct.mp3');
			snd.play();
			game.view.set({
				'dialog.message': 'You have won the game!',
				endgame: true
			});

			/*game.levelCounter ++;*/
			game.score ++;
		},

		gameOver: function() {
			game.finalPoints = game.points - game.calories;
			game.view.set({
				'dialog.message': 'Game Over! You scored ' + game.points + ' points, with a final calorie count of ' + game.calories + ', to give a total of ' + game.finalPoints + ' points',
				endgame: true,
				upgradeOne: game.upgradesList[0],
				upgradeTwo: game.upgradesList[1],
				upgradeThree: game.upgradesList[2]

			});
			game.points = game.finalPoints;
		}

	};

	window.game = game; // for the debugging
	


		//get the food data
	get ('food.csv', function( csv ) {
		var parser = new CSVParser ( csv );
		game.food = parser.json();
	});

	get ('diseases.csv', function( csv ) {
		var parser = new CSVParser ( csv );
		game.diseaseList = parser.json();
	});

		get ('upgrades.csv', function( csv ) {
		var parser = new CSVParser ( csv );
		game.upgradesList = parser.json();
	});



	// load template
	get( 'template.html', function ( template ) {
		game.render( template );
	});





	// helper functions
	function  get ( url, callback ) {
		var xhr = new XMLHttpRequest();

		xhr.open( 'get', url );
		xhr.onload = function () {
			callback( xhr.responseText )
		};

		xhr.send();
	}

	//shuffles array of creatures
	function shuffle ( array ) {
		var counter = array.length, temp, index;

		// While there are elements in the array
		while (counter--) {
			// Pick a random index
			index = (Math.random() * counter) | 0;

			// And swap the last element with it
			temp = array[counter];
			array[counter] = array[index];
			array[index] = temp;
		}

		return array;
	}

	function preload ( url ) {
		var image = new Image();
		image.src = url;
	}

}());