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
    question: "How many days are there in one week?",
    answer: ["seven", "7"],
    response: "There are seven days in one week."
}, {
    question: "Which day comes before Sunday?",
    answer: "Saturday",
    response: "It is Saturday."
}, {
    question: "Which day comes after Saturday?",
    answer: "Sunday",
    response: "It is Sunday."
}]

let TheSun = [{
    question: "What color is the autumn sun?",
    answer: "yellow",
    response: "The autumn sun is yellow."
}, {
    question: "Is the spring sun cold?",
    answer: ["warm", "no"],
    response: "No. it is not. It is warm."
}]

let WhatIsThat = [{
    question: "What is the lowest thing in the classroom?",
    answer: "floor",
    response: "The floor is the lowest thing in the classroom."
}, {
    question: "Which one is the fastest chicken?",
    answer: "chicken",
    response: "The black chicken in the fastest chicken."
}, {
    question: "What is the longest snake?",
    answer: "this",
    response: ""
}]

let BettyBird =[{
    question: "What is this bird’s name?",
    answer: "Betty",
    response: ""
}, {
    question: "When does the Betty Bird make a nest?",
    answer: "spring",
    response: ""
}, {
    question: "Where does the Betty Bird make a nest?",
    answer: "tree",
    response: ""
}]

let JanuaryToDecember = [{
    question: "What time of the year is it?  Is it spring, summer, autumn or winter?",
    answer: getSeason(),
    response: ""
}, {
    question: "What comes after January? ",
    answer: "February",
    response: ""
}, {
    question: "What comes after February?",
    answer: "March",
    response: ""
}]

let Ten = [{
    question: "How many fingers do you have?",
    answer: "ten",
    response: ""
}, {
    question: "How many dogs do you see?",
    answer: "ten",
    response: ""
}, {
    question: "What color are the dogs?",
    answer: "brown",
    response: ""
}]

let TheBallGame = [{
    question: "How many hot dogs will Charles eat?",
    answer: "three",
    response: ""
}, {
    question: "How many steps did they climb to the top? ",
    answer: "thirty",
    response: ""
}, {
    question: "Have you ever been to a ball game?",
    answer: ["yes", "no"],
    response: ""
}]

let incorrectAnswer = ["Nope. Try again.", "Not it."]


let initialPrompt = "The following is a conversation with a kindergarten English teacher. " +
    "The teacher's name is Cindy, and she is very informative and insightful." +
    "She likes to teach English and loves her students." +
    "\n\nStudent: Hello Ms. Cindy!" +
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
    WhatIsThat_responses, BettyBird_responses, JanuaryToDecember_responses,
    Ten_responses, TheBallGame_responses, PhonogramWords_responses
}