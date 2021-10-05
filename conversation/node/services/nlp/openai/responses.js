const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
let dayName = days[new Date().getDay()]

function getSeason() {
    let month = new Date().getMonth()
    let season
    switch (month) {
        case 2: case 3: case 4:
            season = 'Spring'
            break
        case 5: case 6: case 7:
            season = 'Summer'
            break
        case 8: case 9: case 10:
            season = 'Autumn'
            break
        case 11: case 0: case 1:
            season = 'Winter'
            break
    }
    return season
}

let SevenGoodDays = [{
    question: "<uneeq:excited>How many days are there in one week?</uneeq:excited>",
    answer: ["seven", "7"],
    response: "<uneeq:excited>There are seven days in one week.</uneeq:excited>"
}, {
    question: "<uneeq:excited>Which day comes before Sunday?</uneeq:excited>",
    answer: ["Saturday"],
    response: "<uneeq:excited>It is Saturday.</uneeq:excited>"
}, {
    question: "<uneeq:excited>Which day comes after Saturday?</uneeq:excited>",
    answer: ["Sunday"],
    response: "<uneeq:excited>It is Sunday.</uneeq:excited>"
}]

let TheSun = [{
    question: "<uneeq:excited>What color is the autumn sun?</uneeq:excited>",
    answer: ["yellow"],
    response: "<uneeq:excited>The autumn sun is yellow.</uneeq:excited>"
}, {
    question: "<uneeq:excited>Is the spring sun cold?</uneeq:excited>",
    answer: ["warm", "no"],
    response: "<uneeq:excited>It is warm.</uneeq:excited>"
}]

let WhatIsThat = [{
    question: "<uneeq:excited>What is the lowest thing in the classroom?</uneeq:excited>",
    answer: ["floor"],
    response: "<uneeq:excited>The floor is the lowest thing in the classroom.</uneeq:excited>"
}, {
    question: "<uneeq:excited>Which one is the fastest chicken?</uneeq:excited>",
    answer: ["black"],
    response: "<uneeq:excited>The black chicken is the fastest chicken.</uneeq:excited>"
}]

let BettyBird =[{
    question: "<uneeq:excited>What is this bird’s name?</uneeq:excited>",
    answer: ["Betty", "Betty bird"],
    response: "<uneeq:excited>The bird's name is Betty Bird.</uneeq:excited>"
}, {
    question: "<uneeq:excited>When does the Betty Bird make a nest?</uneeq:excited>",
    answer: ["spring", "in the spring", "during the spring"],
    response: "<uneeq:excited>Betty Bird makes the nest in the spring.</uneeq:excited>"
}, {
    question: "<uneeq:excited>Where does the Betty Bird make a nest?</uneeq:excited>",
    answer: ["tree", "high up in the tree"],
    response: "<uneeq:excited>Betty Bird makes the next high up in the tree.</uneeq:excited>"
}]

let JanuaryToDecember = [{
    question: "<uneeq:excited>What time of the year is it?  Is it spring, summer, autumn or winter?</uneeq:excited>",
    answer: [getSeason()],
    response: "<uneeq:excited>It is " + getSeason() + ".</uneeq:excited>"
}, {
    question: "<uneeq:excited>What comes after January?</uneeq:excited>",
    answer: ["February"],
    response: "<uneeq:excited>February comes after January.</uneeq:excited>"
}, {
    question: "<uneeq:excited>What comes after February?</uneeq:excited>",
    answer: ["March"],
    response: "<uneeq:excited>March comes after February.</uneeq:excited>"
}]

let Ten = [{
    question: "<uneeq:excited>How many fingers do you have?</uneeq:excited>",
    answer: ["ten", "10"],
    response: "<uneeq:excited>You have ten fingers.</uneeq:excited>"
}, {
    question: "<uneeq:excited>How many dogs do you see?</uneeq:excited>",
    answer: ["ten", "10"],
    response: "<uneeq:excited>There are ten dogs.</uneeq:excited>"
}, {
    question: "<uneeq:excited>What color are the dogs?</uneeq:excited>",
    answer: ["brown"],
    response: "<uneeq:excited>The dogs are brown.</uneeq:excited>"
}]

let TheBallGame = [{
    question: "<uneeq:excited>How many hot dogs will Charles eat?</uneeq:excited>",
    answer: ["three", "3"],
    response: "<uneeq:excited>Charles will eat all three hot dogs.</uneeq:excited>"
}, {
    question: "<uneeq:excited>How many steps did they climb to the top?</uneeq:excited>",
    answer: ["thirty", "30"],
    response: "<uneeq:excited>They climbed thirty steps.</uneeq:excited>"
}]

let beginning = ["<uneeq:excited>Alright. I hope you were listening to Mr. Jake. </uneeq:excited>",
    "<uneeq:excited>Were you paying attention? </uneeq:excited>",
    "<uneeq:excited>Thanks for listening! </uneeq:excited>",
    "<uneeq:excited>I hope you paid attention to Mr. Jake. </uneeq:excited>",
    "<uneeq:excited>Okay. Look here. </uneeq:excited>"]

let incorrectAnswer = ["<uneeq:enquiring>Oops. That is not what I expected. Please try again. </uneeq:enquiring>",
    "<uneeq:joking>Uh Oh. Someone is not concentrating. Try to think. </uneeq:joking>",
    "<uneeq:joking>I don't think that is the correct answer. Try again. </uneeq:joking>",
    "<uneeq:joking>Try to remember what Mr. Jake said. Do you remember? </uneeq:joking>",
    "<uneeq:joking>Hmm. That is not the correct answer. Please try again. </uneeq:joking>"]

let moveOn = ["<uneeq:excited> Great work! Let's keep going!*</uneeq:excited>",
    "<uneeq:excited> Good job! Let's go ahead to the next one.*</uneeq:excited>",
    "<uneeq:excited> Okay, we are moving on! Hope you are keeping up!*</uneeq:excited>",
    "<uneeq:excited> Shall we go to the next one? Keep up!*</uneeq:excited>",
    "<uneeq:excited> Okay! Let's get going!*</uneeq:excited>"]

let correctAnswer = ["<uneeq:excited>Great job! That is correct! </uneeq:excited>",
    "<uneeq:excited>It looks like you are working hard today! That's right. </uneeq:excited>",
    "<uneeq:excited>Wonderful! </uneeq:excited>",
    "<uneeq:excited>Outstanding! That is correct! </uneeq:excited>",
    "<uneeq:excited>Brilliant! You are right. </uneeq:excited>"]

let initialPrompt = "The following is a conversation with a kindergarten English teacher. " +
    "The teacher's name is Cindy, and she is very informative and insightful." +
    "She likes to teach English and loves her students." +
    "\n\nCindy: Hello everyone!! How's your day?" +
    "\nStudent: Hello Ms. Cindy!" +
    "\nCindy: Hello! How's your day?" +
    "\nStudent: It's great." +
    "\nCindy: "

let SevenGoodDays_responses = ["Let's do Seven Good Days. Repeat after me. Sunday", "Monday*", "Tuesday*", "Wednesday*",
    "Thursday*", "Friday*", "Saturday*", "weeks *", "There are 7 days in a week.", "What day is it today?",
    "Today is " + dayName, "OK. Repeat after me. Seven Good Days.*", "Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.",
    "There are seven good days in one good week and then it is Sunday again.",
    "Good job. Now let's sing the song. Click on the image to play."]
let TheSun_responses = ["Very good. Now let's do 'The Sun'. Watch the video.", "Now, repeat after me. The Sun.*",
    "The spring sun is warm.", "The winter sun is not.", "The autumn sun is yellow.", "The summer sun is hot!"]
let ThreeEggs_responses = ["Good job. Now let's do Three Eggs. First, repeat after me. pop",
    "spring*", "Let's watch the video.*", "Repeat after me. Three Eggs.*", "Mommy bird sits on three eggs. She will not fly away.",
    "In the spring, small birds pop out and play and play and play.*", "How many eggs are there?",
    "Yes, there are three eggs."]
let WhatIsThat_responses = ["Let's do What is That.", "What is that? Is that a short carrot? It's shorter than the others! " +
    "It's the shortest carrot I've ever seen! I'll go and tell my mother.", "What is that? Is that a long snake? " +
    "It's longer than the others. It's the longest snake I've ever seen! I'll go and tell my father.*",
    "What is that? Is that a fast chicken? It's faster than the others! It's the fastest chicken I've ever seen! " +
    "I'll go and tell my sister.*", "What is that? Is that a tall tree house? It's taller than the others! " +
    "It's the tallest tree house I've ever seen! I'll go and tell my brother.*", "What is that? Is that a small flower? " +
    "It's smaller than the others! It's the smallest flower I've ever seen! I'll go and tell my teacher.*",
    "What is that? Is that a loud baby? He's louder than the others! He's the loudest baby I've ever seen! " +
    "Let's go and find his mother!*", "What is the lowest thing in the room?", "The floor. It's the lowest thing in the room.",
    "What is the highest thing in the room?", "The ceiling. It's the highest thing in the room."]
let BettyBird_responses = ["Very good. Let's do Betty Bird. Repeat after me. change", "nest *", "Betty Bird. *", "Spring. I'm Betty Bird. " +
    "In the spring, when it gets warm, I make a nest. I make it high up in a tree. I lay eggs in my nest. Then I sit on them. " +
    "I watch the pretty flowers grow. And I watch out for cats climbing my tree! *", "After many days, little baby birds come out of my eggs. " +
    "They are very hungry! They want to eat all the time! I fly away to find worms for my babies to eat. " +
    "And I watch out for cats climbing my tree! *", "Summer. When summer comes, the days get hot. My babies grow and grow. " +
    "Soon they learn to fly! We sit together and sing a pretty song. And we watch out for cats climbing our tree! *",
    "Autumn. When autumn comes, a cool wind blows. We watch the leaves change colors and fall from the trees. " +
    "And we watch out for cats climbing our tree! *", "Winter. Then winter comes. My babies are big birds now. " +
    "It is cold, and snow falls. Some very nice children put out seeds for us to eat. When we see a cat, we fly back up high into our tree! *",
    "Spring. And then spring comes again. I make a new nest for new eggs. My little ones make nests for their eggs. " +
    "And they watch out for cats climbing their trees!*", "The End *", "What is the bird's name?", "The bird's name is Betty Bird."]
let JanuaryToDecember_responses = ["Let's do January to December. Repeat after me. autumn", "cool *", "cooler", "leaves *", "spring *",
    "summer *", "winter *", "Listen to the song by clicking on the image. *", "January to December. January, February, then comes March. January, February, then comes March. " +
    "When springtime comes and winter goes, it gets warm, and everything grows!", "April, May, and then comes June. April, " +
    "May, and then comes June. When summer comes and springtime goes, it gets hot, as everyone knows!*",
    "July, August, and then September. July, August, and then September. When autumn comes and summer goes, " +
    "leaves turn brown. A cooler wind blows!*", "October, November, and then December. October, November, and then December." +
    "When winter comes and autumn goes, it gets cold, and we hope it snows!*", "What time of the year is it? " +
    "Is it spring, summer, autumn, or winter?", "It is " + getSeason()]
let Ten_responses = ["Let's do Ten. hole", "What is the title of this Book?*", "Yes, the title of this book is Ten.",
    "Let's listen to the song. Click on the image.",
    "I see ten dogs that are brown. They dig ten holes in the ground.*",
    "They make the holes nice and round. They turn around and around and around and around... and then lie down.*",
    "The End *", "Can you show me ten fingers?", "Great. How many toes do you have?", "That is right. You have ten toes.*"]
let TheBallGame_responses = ["Let's do the Ball Game. Repeat after me. bat", "hard*", "soft", "The Ball Game*", "How soon will they get to the park? " +
    "Right before the ball game starts!*", "How many hot dogs will Charles eat? One or two? No, he'll eat all three! " +
    "How much popcorn comes in a box? Get the big one! Marvin wants a lot!*", "How many steps did they climb to the top? " +
    "They climbed thirty steps, and then they stopped!*", "How many bats and balls do you see? Count them and see - one, two, three...*",
    "How many players can you find? Let's count together, one through nine!*", "How hard did he hit that ball? " +
    "Hard enough to go over the wall!*", "How far did that chimp hit the ball? Not very far! Not far at all!*",
    "How does Charles feel right now? He feels very happy! Wow!*", "How loud does Marvin yell? As loud as he can! He likes to yell!*",
    "How many people are here today? I could never count them - there's just no way!*", "How much fun did they have at the game? " +
    "Lots of fun, and they're glad they came!*", "The End*", "Have you ever been to a ball game?"]
let PhonogramWords_responses = ["Now, let's do Phonogram. ch.", "touch *", "school", "ck *", "back *", "er *", "her *",
    "oo *", "moon *", "book", "ou *", "round *", "country", "ow *", "cow *", "row", "peach *", "chimpanzee *", "teacher",
    "lunch", "school *", "school *", "stomach", "duck *", "blocks *", "pocket", "truck", "marker *", "tiger *", "faster", "butterfly",
    "broom *", "zoo *", "moon", "rooster", "foot *", "cookie *", "good", "look", "mouth *", "ouch *", "mouse", "ground", "touch *",
    "young *", "touch", "country", "owl *", "flower *", "brown", "cow", "window *", "snow *", "throw", "bowl",
    "Repeat the following sentence: I ate a peach at school. *", "Try again: I ate a peach at school.", "Good job."]

module.exports = {
    initialPrompt, SevenGoodDays, TheSun, WhatIsThat, BettyBird,
    JanuaryToDecember, Ten, TheBallGame, SevenGoodDays_responses,
    TheSun_responses, ThreeEggs_responses, incorrectAnswer,
    moveOn, correctAnswer, beginning,
    WhatIsThat_responses, BettyBird_responses, JanuaryToDecember_responses,
    Ten_responses, TheBallGame_responses, PhonogramWords_responses
}