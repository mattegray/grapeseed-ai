const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
let dayName = days[new Date().getDay()]

let initialPrompt = "The following is a conversation with a kindergarten English teacher. " +
    "The teacher's name is Cindy, and she is very informative and insightful." +
    "She likes to teach English and loves her students." +
    "\n\nStudent: Hello, how are you?" +
    "\nCindy: I am great! How was your day?" +
    "\nStudent: It was great!" +
    "\nCindy: "
let repeatPrompt = "The teacher (Cindy) is showing cards to the students and the students are repeating after the teacher." +
    "\n\nCindy: Hello\nStudent: Hello\nCindy: Hello\nStudent: Hello" +
    "\nCindy: Candy\nStudent: Candy\nCindy: Candy\nStudent: Candy" +
    "\nCindy: "
let whatIsThatPrompt = "The following is a conversation with a kindergarten English teacher. " +
    "The teacher's name is Cindy, and she is very informative and insightful. " +
    "She likes to teach English and loves her students. " +
    "She is asking her students about the things in the room." +
    "\n\nCindy: What is the lowest thing in your room?" +
    "\nStudent: The floor. It's the lowest thing in the room." +
    "\nCindy: Yes. It's the lowest thing in the room." +
    "\nStudent:" +
    "\nCindy: What is the highest thing in your room?" +
    "\nStudent: The closet. It's the highest thing in the room." +
    "\nCindy: Yes. It's the highest thing in the room." +
    "\nStudent: " +
    "\nCindy: What is the biggest thing in your room?" +
    "\nStudent: The bed. It's the biggest thing in the room." +
    "\nCindy: Yes. It's the biggest thing in the room." +
    "\nStudent:"

let SevenGoodDays_responses = ["Let's do Seven Good Days. Repeat after me. Sunday*", "Monday*", "Tuesday*", "Wednesday*",
    "Thursday*", "Friday*", "Saturday*", "weeks*", "There are 7 days in a week.", "What day is it today?",
    "Today is "+ dayName, "OK. Repeat after me. Seven Good Days.*", "Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.",
    "There are seven good days in one good week and then it is Sunday again.",
    "Good job. Now let's sing the song. Click on the image to play."]
let TheSun_responses = ["Very good. Now let's do 'The Sun'. Watch the video.*", "Now, repeat after me. The Sun.*",
    "The spring sun is warm.", "The winter sun is not.", "The autumn sun is yellow.", "The summer sun is hot!"]
let ThreeEggs_responses = ["Good job. Now let's do Three Eggs. First, repeat after me. pop*",
    "spring*", "Let's watch the video.*", "Three Eggs.*", "Mommy bird sits on three eggs. She will not fly away.",
    "In the spring, small birds pop out and play and play and play.", "How many eggs are there?",
    "Yes, there are three eggs."]
let WhatIsThat_responses = ["Let's do What is That.", "What is that? Is that a short carrot? It's shorter than the others!" +
"It's the shortest carrot I've ever seen! I'll go and tell my mother.", "What is that? Is that a long snake? " +
"It's londer than the others. It's the longest snake I've ever seen! I'll go and tell my father.",
    "What is that? Is that"]
let BettyBird_responses = ["Let's do Betty Bird."]
let JanuaryToDecember_responses = ["Let's do January to December"]
let Ten_responses = ["Let's do Ten"]
let TheBallGame_responses = ["Let's do the Ball Game"]
let PhonogramWords_responses = ["Let's do Phonogram"]

module.exports = {
    SevenGoodDays_responses, TheSun_responses, ThreeEggs_responses,
    WhatIsThat_responses, BettyBird_responses, JanuaryToDecember_responses,
    Ten_responses, TheBallGame_responses, PhonogramWords_responses
}