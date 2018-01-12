 
//all global variables:
var questionArray=[]; //array of objects that gets filled after api call
var counter = 0; //basic variable to go on to the next question
var time = 20; //variable to be used to determine how long the timer will be
var time1; //variable to actually use for the timer. 
var intervalId; //where the set interval
var container;
var categoryText


//functions that only run once:
//*beginning of the game*
function category(){//function to pick a category from the api with buttons screen.

	counter = 0

	clearPage()
	$(".answers").empty();

	$.ajax({ //ajax call to return the categories from the api
		url: "https://opentdb.com/api_category.php",
		method: "GET"
	}).done(function(response) {
		$("#category").html("Please pick a category: <br>")

		for (var i = 0; i < response.trivia_categories.length; i++) {

				var button = $("<button>"); //new variable which is a button element
				button.addClass("category"); //adds a class to each button for styling
				button.addClass("btn btn-primary btn-lg")
				button.attr("id", response.trivia_categories[i].id); //makes an attribute to be used in the next ajax call
				button.text(response.trivia_categories[i].name);

				$("#category").append(button);
			}

		});

};




//gets called when a category is selected
function start(){//sets up the html for the questions and makes an api call for 10 questions from the selected category

	questionArray=[];//clears the quesiton array for second use of game

	$(".timer").html("Time remaining: <span id='timer'></span>")
	$("#allAnswers").html("1:<span class='answers' id='answer1'></span><br>2:<span class='answers' id='answer2'></span><br>3:<span class='answers' id='answer3'></span><br>4:<span class='answers' id='answer4'></span><br>")
	//^sets up the html for questions 
	categoryText = $(this).text()
	$("#category").html("Category: "+categoryText);//makes the category display on screen

	var categoryId =($(this).attr("id"));
	var queryURL = "https://opentdb.com/api.php?amount=10&category="+categoryId+"&type=multiple";
	//^putting the category into the query url

	$.ajax({ //api call for the questions
		url: queryURL,
		method: "GET"
	}).done(function(response) {

		for (var i = 0; i < response.results.length; i++) {

    		var objectHolder = { //creates an object for each question with the following info:

    			question: response.results[i].question,
    			answer1: response.results[i].incorrect_answers[0],
    			answer2: response.results[i].incorrect_answers[1],
    			answer3: response.results[i].incorrect_answers[2],
    			correctAnswer: response.results[i].correct_answer,
    			correct: false, //place holder true to be changed after the question is answered
    			userAnswer: "your answer" //place holder to be changed when the user answers
    		};

			questionArray.push(objectHolder);//pushes each object into the question array
		}

		nextQuestion()
	});
}

//*end of the game*
function endGame() { //function to display correct and incorrect answers once the game finishes

	clearPage()
	$(".answers").empty();
	$("#category").empty()
	$("#allAnswers").empty()

	$("#result").html("Thats all the questions this round...")

	var buttonHolder = $("<button>"); //make a button that will restart the game on click
	buttonHolder.attr("class", "btn btn-primary btn-m")
	buttonHolder.attr("id", "playAgain"); //adds id for on click function
	buttonHolder.text("Play Again!"); //text of button

	$("#result").append(buttonHolder); //adds button to html

	$("#playAgain").on("click", function(){ //on click for above button
		category()
	})

	resultsPage()
}

function resultsPage(){ //function to display all questions, user's answer, and correct answer at the end of the game
	for (var i = 0; i < questionArray.length; i++) {//for loop to loop through the 

		var element = $("<div>");
		element.html((i+1))

		if (questionArray[i].correct === true) {
			element.addClass("winner");
		}

		else if (questionArray[i].correct === false) {
			element.addClass("loser");
		}

		var questionElement = $("<div>"); //makes a new element for the question, adds a class and pushes it into the above element
		questionElement.html("Question: "+questionArray[i].question);
		questionElement.addClass("questionElement");
		element.append(questionElement);


		var yourAnswerElement = $("<div>"); //makes a new element for user's answer, adds a class and pushes it into the above element
		yourAnswerElement.html("Your Answer: "+questionArray[i].userAnswer);
		yourAnswerElement.addClass("yourAnswerElement");
		element.append(yourAnswerElement);

		var correctAnswerElement = $("<div>"); //makes a new element for the correct answer, adds a class and pushes it into the above element
		correctAnswerElement.html("Correct Answer: "+questionArray[i].correctAnswer);
		correctAnswerElement.addClass("correctAnswerElement");
		element.append(correctAnswerElement);

		$("#result").append(element); //appends element variable into the result id

	}
}




//repeated functions:
function nextQuestion(){ //function to display each question on screen

	if (counter < questionArray.length) { //if there are questions left

		var answerArray = [] //makes an array to hold the answers to current question

		answerArray.push(questionArray[counter].answer1)
		answerArray.push(questionArray[counter].answer2)
		answerArray.push(questionArray[counter].answer3)
		answerArray.push(questionArray[counter].correctAnswer)

		shuffleArray(answerArray) //shuffles the answer array

		$("#answer1").html("<button type='button' class='btn btn-outline-warning'>"+answerArray[0]+"</button>");
		$("#answer2").html("<button type='button' class='btn btn-outline-warning'>"+answerArray[1]+"</button>");
		$("#answer3").html("<button type='button' class='btn btn-outline-warning'>"+answerArray[2]+"</button>");
		$("#answer4").html("<button type='button' class='btn btn-outline-warning'>"+answerArray[3]+"</button>");
		$("#category").html("Category: "+categoryText + "<br>");
		$("#category").append("Questions Remaining: "+(10-counter))
		$("#question").html(questionArray[counter].question);

		time = 20
		startTimer();
	}

	else { //if you have answered all of the questions
		endGame()
	}

}




function game () { //stops timer and checks if answer was correct or not
	stop();
	clearPage();

	$(".timer").html("Next Question In: <span id='timer'></span>")

	container = $(this).text();
	questionArray[counter].userAnswer = container; //stores user's answer in each question's object for the end of the game
	time = 5

	if (container == (questionArray[counter].correctAnswer)) {
		$(".answers").empty()

		questionArray[counter].correct = true;//stores in the object if the user got the question correct
		$("#result").html("<div class='win'>Correct!</div>") //display on screen the win, start timer (5 sec), next question after timer

		startTimer();
	}

	else {
		$(".answers").empty()

		questionArray[counter].correct = false;//stores in the object if the user got the question wrong
		$("#result").html("<div class='loss'>incorrect...</div>");
		$("#correctAnswer").html("The Correct Answer Was: "+questionArray[counter].correctAnswer);

		startTimer();
	}
}
function clearPage(){ //function to empty divs on screen
	$(".timer").empty(); 
	$("#result").empty();
	$("#correctAnswer").empty()
	$("#question").empty()
}
function shuffleArray(array) {//shuffle function I found online so that the correct answer isnt always #4
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array
}






//functions for timers:

	function startTimer() { //starts the timer either for 5 or 20 seconds, depending on value of time variable
		time1 = time
		intervalId = setInterval(timer, 1000);
	}
	
	function timer() { //repeated function every second for timer
		time1--;
		$("#timer").html(time1);
		
		if (time1 === 0) {
			stop();
			timeOut();
		}

	}
	
	function stop() { //stops timer
		clearInterval(intervalId);
	}
	
	function timeOut() { //when ever the timer reaches 0 runs this function
		stop();
		clearPage()
		$(".answers").empty();
		
		if (time === 20) { //if the timer was counting from 20 (for a question), says you ran out of time and starts a timer from 5
			$(".timer").html("Next Question In: <span id='timer'></span>")
			$("#result").html("Oops! Ran out of time")
			
			questionArray[counter].correct = false;
			questionArray[counter].userAnswer = "Out of time"

			time = 5
			startTimer();
		}
		
		else if (time === 5){ //if the timer was counting from 5 it runs next question function with the counter increased by 1
			counter++
			$(".timer").html("Time remaining: <span id='timer'></span>")
			nextQuestion()
		}
	}

$(document).on("click", ".answers", game);//whenever you click an answer button, runs the game function
$(document).on("click", ".category", start);//whenever you click a category button it runs the start function

category()//calling category function at the start