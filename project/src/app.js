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
				start: game.start,

				timer: function () {
					game.timer();
				},

				displayFood: function (){
					game.displayFood( );
				},

				selectFood: function(event, foodItemNumber ){
					game.selectFood( foodItemNumber );
				},

				foodItemReset: function ( event, string) {
					game.foodItemReset( string );
				},

				submitOffspring: function (event){
					game.submitOffspring();
				},

				continuePlaying: function(event){
					game.continuePlaying();
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
					nextMateInstructions: false,
					objectives: false,
					endgame: false,
					dialog: false
				
			});
		},

		// Start a new round
		start: function () {

			game.reset();
			game.timer();

			/*function timer(){
	
			var running = 1;

			function startTimer(){
				if(running == 1)
					increment();

			}*/
			



			// Clone csv data for food items
			var food = game.food
			shuffle(food);


			game.points = 0;
			game.calories = 0;


			//clone csv data for instructions

			var instructions = game.instructions



			// Unfade images and hide initial message
			game.view.set({
				foodGrid: true,
				foodItemOne: game.food[0],
				foodItemTwo: game.food[1],
				foodItemThree: game.food[2],
				foodItemFour: game.food[3],
				foodItemFive: game.food[4],
				foodItemSix: game.food[5],
				foodItemSeven: game.food[6],
				foodItemEight: game.food[7],
				foodItemNine: game.food[8],
				foodItemTen: game.food[9],
				foodItemEleven: game.food[10],
				foodItemTwelve: game.food[11],
				'stats.points': game.points,
				'stats.calories': game.calories
				
			});

		},

		timer: function(){
			var time = 0;
			game.turns = 2;

			function startTimer(){
				if(game.turns > 0){
					increment();
				}
			}

			function increment(){ 
				if(game.turns > 0){
				setTimeout(function(){
						
						time++;
						var mins = Math.floor(time/10/60);
						var secs = Math.floor(time/10);
						var tenths = time % 10;
						if(secs == 5) {
							time = 0;
							game.displayFood();
							game.turns --;
							}
						if(secs < 10){
							secs = '0' + secs;
						}


						game.view.set({

							'timer.mins': mins,
							'timer.secs': secs,
							'timer.tenths': tenths,
							turns: game.turns

						});


						increment();

					},100);
				}
				}

			startTimer();
			},		


		//mates the two parents to create 4 offspring- start with object constructor
		createOffspring: function () {

		function Offspring(gene1, gene2, gene3, gene4, name ) {
	
			this.name = name;
			this.description = 'Unknown';
			this.image = 'Unknown';
			this.genotype1 = gene1;
			this.genotype2 = gene2;
			this.genotype3 = gene3;
			this.genotype4 = gene4;
			this.dominants = 0;
			this.recessives = 0;

		}
		
		//this method sets the number of dominant & recessive genes property, as well as the description, for each offspring created.
		Offspring.prototype.setDescription = function ( array ){
				for (var i=0; i<array.length; i++) {
					if (array[i].genotype1 === this.genotype1 && array[i].genotype2 === this.genotype2 && array[i].genotype3 === this.genotype3 && array[i].genotype4 === this.genotype4){
						this.description = array[i].description;
						this.dominants += array[i].dominants;
						this.recessives += array[i].recessives;
						this.image = array[i].image;
					}
				}
			}
		
		

		//Punnet Square version - create the 4 offspring based on the combinations of the parents' genes. Put them in an array
		game.allOffspring = [];
		game.allOffspring[0] = new Offspring(game.mother.genotype1, game.father.genotype1, game.mother.genotype3, game.father.genotype3, 'Offspring 1');
		game.allOffspring[1] = new Offspring(game.mother.genotype1, game.father.genotype2, game.mother.genotype3, game.father.genotype4, 'Offspring 2');
		game.allOffspring[2] = new Offspring(game.mother.genotype2, game.father.genotype1, game.mother.genotype4, game.father.genotype3, 'Offspring 3');
		game.allOffspring[3] = new Offspring(game.mother.genotype2, game.father.genotype2, game.mother.genotype4, game.father.genotype4, 'Offspring 4');

		//set their dominant/recessive gene count and description
		function offspringDescriptions(){
				
				for(var i = 0; i<game.allOffspring.length; i++){
					if(game.allOffspring[i].genotype3 && game.allOffspring[i].genotype4 == 'X'){
						game.allOffspring[i].setDescription(game.level[3]);
					}else{
					game.allOffspring[i].setDescription(game.level[game.levelCounter]);
				}

			}
		}

		offspringDescriptions();

		//move the offspring counter up by one and reset the mother/father names so they don't stay as 'new mummy' and 'new daddy' (only applicable afer the first mating) 
		game.generation.number +=1;
		game.mother.name = 'Mummy';
		game.father.name = 'Daddy';




			game.view.set({
				'offspringOne': game.allOffspring[0],
				'offspringTwo': game.allOffspring[1],
				'offspringThree': game.allOffspring[2],
				'offspringFour': game.allOffspring[3],
				selectedParent: null,
				selectedParent2: null,
				mother: game.mother,
				father: game.father,
				generation: game.generation,
				firstInstructions: false,
				secondInstructions: true,
				nextMateInstructions: true,
				submitOffspring: true,
				mateButton: false			
			});
		},

		//takes the selected gender when choosing the new parent (and allows user to change this)
		displayFood: function ( ){
			var food = game.food
			shuffle(food);
		game.view.set({
				foodItemOne: game.food[0],
				foodItemTwo: game.food[1],
				foodItemThree: game.food[2],
				foodItemFour: game.food[3],
				foodItemFive: game.food[4],
				foodItemSix: game.food[5],
				foodItemSeven: game.food[6],
				foodItemEight: game.food[7],
				foodItemNine: game.food[8],
				foodItemTen: game.food[9],
				foodItemEleven: game.food[10],
				foodItemTwelve: game.food[11]
				
			});
		},


		// Select offspring to become parents
		selectFood: function ( foodItemNumber ) {
			if(game.turns > 0 ){
			game.points += game.food[foodItemNumber-1].points;
			game.calories += game.food[foodItemNumber-1].calories;
			game.view.set({
				'stats.points': game.points,
				'stats.calories': game.calories

				});
			}
		},


		submitOffspring: function () {
			var offspringDominants = 0;
			var offspringRecessives = 0;

			for (var i=0; i<game.allOffspring.length; i++) {
				 offspringDominants +=  game.allOffspring[i].dominants;
				 offspringRecessives += game.allOffspring[i].recessives;

			}
			

			if (offspringDominants === game.thisGameTarget.dominantsTotals && offspringRecessives === game.thisGameTarget.recessivesTotals){
				game.winGame();
			} else {
				game.continue();
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

		continue: function () {
			// offspring aren't correct
			var snd = new Audio('assets/nature/incorrect.mp3');
			snd.play();
			game.score --;
			game.view.set({
				'dialog.message': "Nope! Those offspring aren't right. Try Again",
				wrong: true,
				score: game.score
			});


		},

		continuePlaying: function(){
			game.view.set({
				dialog: false
			});
		}


	};

	window.game = game; // for the debugging
	


		//get the food data
	get ('food.csv', function( csv ) {
		var parser = new CSVParser ( csv );
		game.food = parser.json();
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