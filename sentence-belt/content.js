// Sentence Belt content bank for WordRaiders.
// Each item: parts are in the one correct teaching order.
// free: groups of part indexes that may swap and still be correct.
// choices: correct answer first (answer:0); the page shuffles them.

export const LESSONS = [
  {
    id: 'topic',
    title: 'Topic sentence',
    job: 'Start with the sentence that tells what the whole paragraph is about.',
    items: [
      {
        id: 'topic-01',
        parts: [
          'Octopuses are some of the smartest animals in the sea.',
          'They can open jars to get the food inside.',
          'Some octopuses carry shells to use as little hiding houses.',
          'These clever creatures keep surprising the people who study them.'
        ],
        free: [[1, 2]],
        question: 'What is this paragraph mostly about?',
        choices: [
          'Octopuses are very smart sea animals.',
          'Octopuses can open jars to find food.',
          'Many sea animals hide inside shells.'
        ],
        answer: 0,
        why: 'Every sentence shows a way octopuses are clever.'
      },
      {
        id: 'topic-02',
        parts: [
          'A cactus is built to live in the hot, dry desert.',
          'Its thick stem stores water for many weeks.',
          'Sharp spines keep thirsty animals from taking a bite.',
          'So a cactus can stay green even when rain is rare.'
        ],
        free: [[1, 2]],
        question: 'What is this paragraph mostly about?',
        choices: [
          'How a cactus survives in the dry desert.',
          'How a cactus stores water in its stem.',
          'Why all desert plants have sharp spines.'
        ],
        answer: 0,
        why: 'The stem and the spines both help the cactus live where it is dry.'
      },
      {
        id: 'topic-03',
        parts: [
          'Playing soccer takes a lot of teamwork.',
          'Players pass the ball to teammates who are open.',
          'The goalie shouts to tell defenders where to stand.',
          'When everyone works together, the team plays its best.'
        ],
        free: [[1, 2]],
        question: 'What is this paragraph mostly about?',
        choices: [
          'Soccer players must work as a team.',
          'Soccer players pass the ball a lot.',
          'The goalie is the most important player.'
        ],
        answer: 0,
        why: 'Passing and shouting are both ways players help each other.'
      },
      {
        id: 'topic-04',
        parts: [
          'The Moon seems to change shape in our sky each month.',
          'Some nights it looks like a round, bright circle.',
          'Other nights it is only a thin, curved sliver.',
          'Then it slowly grows round again, and the pattern repeats.'
        ],
        free: [],
        question: 'What is this paragraph mostly about?',
        choices: [
          'How the Moon seems to change shape.',
          'Why the Moon is a bright circle.',
          'How the Moon lights up the night sky.'
        ],
        answer: 0,
        why: 'The paragraph shows the Moon looking different on different nights.'
      },
      {
        id: 'topic-05',
        parts: [
          'Honeybees work hard to help their whole hive.',
          'Some bees fly out to collect nectar from flowers.',
          'Other bees stay inside to feed the baby bees.',
          'Every bee has a job that keeps the hive going.'
        ],
        free: [],
        question: 'What is this paragraph mostly about?',
        choices: [
          'Honeybees each do jobs to help the hive.',
          'Honeybees collect nectar from flowers.',
          'Baby bees need lots of food to grow.'
        ],
        answer: 0,
        why: 'Collecting nectar and feeding babies are both jobs that help the hive.'
      },
      {
        id: 'topic-06',
        parts: [
          'A library is a great place to visit.',
          'You can borrow books about almost anything.',
          'Many libraries have puzzles, games, and comfy chairs.',
          'Best of all, a library card costs nothing.'
        ],
        free: [[1, 2]],
        question: 'What is this paragraph mostly about?',
        choices: [
          'Why a library is a great place to go.',
          'How to borrow books from a library.',
          'Why libraries have games and puzzles.'
        ],
        answer: 0,
        why: 'Each detail gives a reason a library is fun to visit.'
      },
      {
        id: 'topic-07',
        parts: [
          'Wind can be very helpful to people.',
          'It turns big windmills that make electricity.',
          'Wind pushes sailboats across lakes and seas.',
          'So a windy day can be a useful day.'
        ],
        free: [[1, 2]],
        question: 'What is this paragraph mostly about?',
        choices: [
          'Ways that wind helps people.',
          'How windmills make electricity.',
          'Why sailboats need strong wind.'
        ],
        answer: 0,
        why: 'Windmills and sailboats are two ways wind is useful.'
      },
      {
        id: 'topic-08',
        parts: [
          'The wheel is one of the most useful inventions ever.',
          'Wheels help bikes, cars, and trains carry people around.',
          'Wheels on carts make heavy loads easier to push.',
          'Life would be much harder without this simple circle.'
        ],
        free: [[1, 2]],
        question: 'What is this paragraph mostly about?',
        choices: [
          'The wheel is a very useful invention.',
          'Wheels help bikes and cars move.',
          'All inventions make life easier.'
        ],
        answer: 0,
        why: 'Each detail shows a way wheels help us.'
      },
      {
        id: 'topic-09',
        parts: [
          'Good friends help each other in many ways.',
          'They share snacks when someone forgets lunch.',
          'They cheer loudly when a friend tries something new.',
          'That kind of help makes friendships strong.'
        ],
        free: [[1, 2]],
        question: 'What is this paragraph mostly about?',
        choices: [
          'Friends help each other in many ways.',
          'Friends share snacks at lunch.',
          'How to make a new friend at school.'
        ],
        answer: 0,
        why: 'Sharing and cheering are both ways friends help.'
      },
      {
        id: 'topic-10',
        parts: [
          'Dolphins talk to each other with sounds.',
          'They make clicks, whistles, and squeaks underwater.',
          'Each dolphin has its own whistle, like a name.',
          'These sounds help dolphins stay close to their pod.'
        ],
        free: [[1, 2]],
        question: 'What is this paragraph mostly about?',
        choices: [
          'How dolphins use sounds to talk.',
          'Each dolphin has a special whistle.',
          'Many sea animals make sounds underwater.'
        ],
        answer: 0,
        why: 'Every sentence is about the sounds dolphins use to talk.'
      }
    ]
  },
  {
    id: 'details',
    title: 'Supporting details',
    job: 'Put the details in the middle. Each one backs up the topic sentence.',
    items: [
      {
        id: 'details-01',
        parts: [
          "A giraffe's long neck helps it in many ways.",
          'It can reach leaves high up in tall trees.',
          'Being tall lets it see far across the grassland.',
          "That long neck is a giraffe's best tool."
        ],
        free: [[1, 2]],
        question: 'Which detail shows that the long neck helps a giraffe eat?',
        choices: [
          'It can reach leaves high up in tall trees.',
          'Being tall lets it see far across the grassland.',
          "That long neck is a giraffe's best tool."
        ],
        answer: 0,
        why: 'Reaching leaves is how the neck helps a giraffe get food.'
      },
      {
        id: 'details-02',
        parts: [
          'Recycling helps take care of our planet.',
          'Old cans can be melted and made into new cans.',
          'Used paper can become fresh notebooks and boxes.',
          'So putting things in the blue bin really matters.'
        ],
        free: [[1, 2]],
        question: 'Why does the writer tell us about old cans and used paper?',
        choices: [
          'To show how recycled things get used again.',
          'To explain how to sort a blue bin.',
          'To show that cans are better than paper.'
        ],
        answer: 0,
        why: 'Cans and paper are examples of trash becoming something new.'
      },
      {
        id: 'details-03',
        parts: [
          'Getting enough sleep helps kids feel their best.',
          'Sleep gives your body time to grow and heal.',
          'A rested brain remembers school lessons better.',
          'So a good bedtime is worth sticking to.'
        ],
        free: [[1, 2]],
        question: 'Which detail shows that sleep helps you learn?',
        choices: [
          'A rested brain remembers school lessons better.',
          'Sleep gives your body time to grow and heal.',
          'A good bedtime is worth sticking to.'
        ],
        answer: 0,
        why: 'Remembering lessons is part of learning.'
      },
      {
        id: 'details-04',
        parts: [
          'Camels are well suited for life in the desert.',
          'Their humps store fat for energy on long trips.',
          'Long eyelashes keep blowing sand out of their eyes.',
          'With these tools, camels can cross the desert for days.'
        ],
        free: [[1, 2]],
        question: "Why does the writer tell us about the camel's eyelashes?",
        choices: [
          'To show how camels handle blowing sand.',
          'To show how camels store energy for trips.',
          'To show that camels can walk for days.'
        ],
        answer: 0,
        why: 'The eyelashes protect camel eyes from desert sand.'
      },
      {
        id: 'details-05',
        parts: [
          'Sunflowers are amazing plants to grow.',
          'They can grow taller than a grown-up in one summer.',
          'Young sunflower heads turn to follow the sun.',
          'It is easy to see why gardeners love them.'
        ],
        free: [[1, 2]],
        question: 'Which detail shows that sunflowers grow very fast?',
        choices: [
          'They can grow taller than a grown-up in one summer.',
          'Young sunflower heads turn to follow the sun.',
          'Sunflowers are amazing plants to grow.'
        ],
        answer: 0,
        why: 'Growing that tall in just one summer means they grow quickly.'
      },
      {
        id: 'details-06',
        parts: [
          'Kids can be a big help at home.',
          'They can set the table before dinner.',
          'They can fold towels and put them away.',
          'Small jobs like these make the whole house run better.'
        ],
        free: [[1, 2]],
        question: 'Why does the writer tell us about setting the table and folding towels?',
        choices: [
          'They are examples of ways kids can help.',
          'They are the hardest jobs in a house.',
          'They are jobs that must be done before dinner.'
        ],
        answer: 0,
        why: 'Both jobs show how kids can help at home.'
      },
      {
        id: 'details-07',
        parts: [
          'Living in space is very different from living on Earth.',
          'Astronauts float around because they feel weightless.',
          'They sleep in bags strapped to the wall.',
          'Even simple things become an adventure up there.'
        ],
        free: [],
        question: 'Which detail shows that sleeping in space is different?',
        choices: [
          'They sleep in bags strapped to the wall.',
          'Astronauts float around because they feel weightless.',
          'Even simple things become an adventure up there.'
        ],
        answer: 0,
        why: 'On Earth we sleep in beds, not in bags on the wall.'
      },
      {
        id: 'details-08',
        parts: [
          'Rainbows appear when sunlight and rain meet.',
          'Sunlight shines through tiny raindrops in the air.',
          'Each drop bends the light and splits it into colors.',
          'That is why rainbows often show up after a shower.'
        ],
        free: [],
        question: "Which detail explains where a rainbow's colors come from?",
        choices: [
          'Each drop bends the light and splits it into colors.',
          'Sunlight shines through tiny raindrops in the air.',
          'Rainbows often show up after a shower.'
        ],
        answer: 0,
        why: 'The colors appear when the raindrop splits the light.'
      },
      {
        id: 'details-09',
        parts: [
          'Ants are tiny, but they are very strong.',
          'One ant can lift something many times its own weight.',
          'A group of ants can carry a whole cracker home.',
          'Their small size does not stop them from doing big jobs.'
        ],
        free: [[1, 2]],
        question: 'Which detail shows that ants are strong even on their own?',
        choices: [
          'One ant can lift something many times its own weight.',
          'A group of ants can carry a whole cracker home.',
          'Ants are tiny, but they are very strong.'
        ],
        answer: 0,
        why: 'It tells about just one ant lifting a heavy load.'
      },
      {
        id: 'details-10',
        parts: [
          'Riding a bike is a great way to get around town.',
          'Biking is faster than walking, so trips take less time.',
          'Bikes do not need gas, so they keep the air clean.',
          'For all these reasons, a bike is a smart way to travel.'
        ],
        free: [[1, 2]],
        question: 'Which detail shows that bikes are good for the planet?',
        choices: [
          'Bikes do not need gas, so they keep the air clean.',
          'Biking is faster than walking, so trips take less time.',
          'A bike is a smart way to travel.'
        ],
        answer: 0,
        why: 'Clean air is good for the planet.'
      }
    ]
  },
  {
    id: 'order',
    title: 'Time order',
    job: 'Follow the clues like First, Next, Then, and Finally to put the steps in order.',
    items: [
      {
        id: 'order-01',
        parts: [
          'Planting a seed is easy if you follow the steps.',
          'First, fill a small pot with soft soil.',
          'Next, poke a hole with your finger and drop in a seed.',
          'Then, cover the seed and give it a little water.',
          'Finally, set the pot in a sunny window and wait.'
        ],
        free: [],
        question: 'What happens right after you drop in the seed?',
        choices: [
          'You cover the seed and give it water.',
          'You fill the pot with soft soil.',
          'You set the pot in a sunny window.'
        ],
        answer: 0,
        why: 'The seed must be covered and watered before it goes in the window.'
      },
      {
        id: 'order-02',
        parts: [
          'Making a cheese sandwich takes just a few steps.',
          'First, lay two slices of bread on a plate.',
          'Next, place a slice of cheese on one piece.',
          'Then, add some crunchy lettuce on top of the cheese.',
          'Last, press the other slice on top and enjoy.'
        ],
        free: [],
        question: 'Why must the cheese go on before the top slice of bread?',
        choices: [
          'The top slice closes the sandwich, so fillings go in first.',
          'The lettuce has to go on before the cheese.',
          'The top slice goes on first to hold the cheese.'
        ],
        answer: 0,
        why: 'You cannot add fillings after the sandwich is closed.'
      },
      {
        id: 'order-03',
        parts: [
          'A butterfly grows in four big stages.',
          'First, it begins as a tiny egg on a leaf.',
          'Next, a hungry caterpillar hatches and eats and eats.',
          'Then, the caterpillar wraps itself inside a chrysalis.',
          'Finally, a butterfly comes out and spreads its wings.'
        ],
        free: [],
        question: 'What happens right before the butterfly comes out?',
        choices: [
          'The caterpillar wraps itself in a chrysalis.',
          'A tiny egg sits on a leaf.',
          'The caterpillar hatches from the egg.'
        ],
        answer: 0,
        why: 'The butterfly comes out of the chrysalis, so the chrysalis comes just before.'
      },
      {
        id: 'order-04',
        parts: [
          'First, wet your toothbrush under the tap.',
          'Next, squeeze a pea-sized dab of toothpaste onto it.',
          'Then, brush every tooth gently for two minutes.',
          'Finally, rinse your mouth and your brush with water.'
        ],
        free: [],
        question: 'What is the first step?',
        choices: [
          'Wet your toothbrush under the tap.',
          'Squeeze toothpaste onto the brush.',
          'Rinse your mouth with water.'
        ],
        answer: 0,
        why: 'The word First tells us wetting the brush comes before everything else.'
      },
      {
        id: 'order-05',
        parts: [
          'Building a snowman is a fun winter project.',
          'First, roll a big snowball for the bottom.',
          'Next, stack a medium snowball on top of it.',
          'Then, add a small snowball for the head.',
          'Last, give your snowman a carrot nose and a scarf.'
        ],
        free: [],
        question: 'Why must the big snowball come first?',
        choices: [
          'It has to hold up the snowballs on top.',
          'It is the smallest, so it goes on top.',
          'It needs the carrot nose before anything else.'
        ],
        answer: 0,
        why: 'The bottom ball holds up the rest, so it has to be there first.'
      },
      {
        id: 'order-06',
        parts: [
          'Before a rocket launch, the team counts down from ten.',
          'When the count reaches zero, the engines roar to life.',
          'Next, the rocket slowly lifts off the launch pad.',
          'Then, it speeds up and climbs into the sky.',
          'Soon, it is just a tiny dot far above.'
        ],
        free: [],
        question: 'What happens right after the engines roar to life?',
        choices: [
          'The rocket lifts off the launch pad.',
          'The team counts down from ten.',
          'The rocket becomes a tiny dot in the sky.'
        ],
        answer: 0,
        why: 'The word Next shows that lifting off comes right after the engines start.'
      },
      {
        id: 'order-07',
        parts: [
          'First, fill the tub with warm water.',
          'Next, help your dog step gently into the tub.',
          'Then, rub dog shampoo into its fur.',
          'After that, rinse away every bit of the bubbles.',
          'Finally, wrap your dog in a big, fluffy towel.'
        ],
        free: [],
        question: 'Why must you rinse before using the towel?',
        choices: [
          'The towel should dry clean fur, not soapy fur.',
          'The shampoo works best after the towel.',
          'The water must be warm before the dog gets in.'
        ],
        answer: 0,
        why: 'You wash off the soap first, then dry the clean dog.'
      },
      {
        id: 'order-08',
        parts: [
          'First, the sun warms water in lakes and oceans.',
          'Next, the water rises into the air as invisible vapor.',
          'Then, the vapor cools and forms clouds high above.',
          'Finally, the water falls back down as rain.'
        ],
        free: [],
        question: 'What happens right after the vapor cools?',
        choices: [
          'It forms clouds high above.',
          'It falls back down as rain.',
          'The sun warms the lake water.'
        ],
        answer: 0,
        why: 'Cooling vapor makes clouds, and the rain comes later.'
      },
      {
        id: 'order-09',
        parts: [
          'Mia gets ready for school the same way each morning.',
          'First, she makes her bed and gets dressed.',
          'Next, she eats a warm bowl of oatmeal.',
          'Then, she packs her homework into her backpack.',
          'Finally, she ties her shoes and heads out the door.'
        ],
        free: [],
        question: 'What does Mia do right before she ties her shoes?',
        choices: [
          'She packs her homework into her backpack.',
          'She eats a warm bowl of oatmeal.',
          'She makes her bed and gets dressed.'
        ],
        answer: 0,
        why: 'Packing comes with Then, just before the Finally step.'
      },
      {
        id: 'order-10',
        parts: [
          'First, squeeze the juice from four lemons into a pitcher.',
          'Next, stir in some sugar until you cannot see it.',
          'Then, pour in cold water and add some ice.',
          'Finally, taste it and pour a glass for a friend.'
        ],
        free: [],
        question: 'What do you do right after stirring in the sugar?',
        choices: [
          'Pour in cold water and add ice.',
          'Squeeze the juice from the lemons.',
          'Taste it and pour a glass.'
        ],
        answer: 0,
        why: 'The word Then shows the water and ice come right after the sugar.'
      }
    ]
  },
  {
    id: 'conclusion',
    title: 'Wrap-up sentence',
    job: 'End with the sentence that wraps up the big idea.',
    items: [
      {
        id: 'conclusion-01',
        parts: [
          'Sea turtles travel very far across the ocean.',
          'Some swim thousands of miles to find food.',
          'Many return to the same beach where they hatched.',
          'These amazing swimmers are true ocean explorers.'
        ],
        free: [[1, 2]],
        question: 'What does the last sentence do?',
        choices: [
          'It sums up that sea turtles are great travelers.',
          'It adds a new fact about where turtles eat.',
          'It says turtles only stay near one beach.'
        ],
        answer: 0,
        why: 'Calling them explorers wraps up all the traveling details.'
      },
      {
        id: 'conclusion-02',
        parts: [
          'Cooking dinner with family can be lots of fun.',
          'Everyone gets a job, like washing or stirring.',
          'You can taste new foods and learn new skills.',
          'In the end, the meal tastes better because you made it together.'
        ],
        free: [[1, 2]],
        question: 'Which idea does the paragraph end on?',
        choices: [
          'Food made together is extra special.',
          'Everyone should learn to stir a pot.',
          'Trying new foods is the best part of cooking.'
        ],
        answer: 0,
        why: 'The last sentence says the meal is better because the family made it together.'
      },
      {
        id: 'conclusion-03',
        parts: [
          'Owls are built for finding food at night.',
          'Their huge eyes help them see in the dark.',
          'Soft feathers let them fly without making a sound.',
          'So when the sun goes down, owls are ready to work.'
        ],
        free: [[1, 2]],
        question: 'What does the last sentence do?',
        choices: [
          'It shows how the details make owls ready for night.',
          'It adds a new fact about owl feathers.',
          'It tells us owls sleep all night long.'
        ],
        answer: 0,
        why: 'It ties the eyes and feathers back to the big idea about night.'
      },
      {
        id: 'conclusion-04',
        parts: [
          'Practice helps you get better at basketball.',
          'Shooting every day makes your aim more steady.',
          'Dribbling drills help you control the ball.',
          'That is why great players never skip practice.'
        ],
        free: [[1, 2]],
        question: 'What does the last sentence do?',
        choices: [
          'It explains why practice matters so much.',
          'It adds one more drill to try.',
          'It says great players do not need to practice.'
        ],
        answer: 0,
        why: 'It wraps up the details by saying practice is worth doing.'
      },
      {
        id: 'conclusion-05',
        parts: [
          'Trees give us much more than shade.',
          'They make the fresh air we breathe.',
          'Their roots hold soil in place when it rains.',
          'Clearly, trees are worth caring for and protecting.'
        ],
        free: [[1, 2]],
        question: 'Which idea does the paragraph end on?',
        choices: [
          'Trees are worth caring for.',
          'Trees give us cool shade.',
          'Tree roots stop soil from washing away.'
        ],
        answer: 0,
        why: 'After all the ways trees help, the writer says we should protect them.'
      },
      {
        id: 'conclusion-06',
        parts: [
          'The Sun is very important to life on Earth.',
          'Its light helps plants make their food.',
          'Its heat keeps our planet warm enough to live on.',
          'Without the Sun, Earth would be a cold, dark place.'
        ],
        free: [[1, 2]],
        question: 'What does the last sentence do?',
        choices: [
          'It shows how much we need the Sun.',
          'It adds a new fact about plants.',
          'It explains how the Sun makes its heat.'
        ],
        answer: 0,
        why: 'Imagining Earth without the Sun shows how important it is.'
      },
      {
        id: 'conclusion-07',
        parts: [
          'Our class hamster, Nibbles, needs care every day.',
          'Someone fills his water bottle each morning.',
          'Another student gives him fresh seeds and veggies.',
          'Taking turns keeps Nibbles happy and healthy.'
        ],
        free: [],
        question: 'What does the last sentence do?',
        choices: [
          'It shows that sharing the jobs keeps Nibbles well.',
          'It tells which student feeds Nibbles.',
          'It says Nibbles likes seeds best.'
        ],
        answer: 0,
        why: 'It wraps up how all the care helps Nibbles.'
      },
      {
        id: 'conclusion-08',
        parts: [
          'Light bulbs changed the way people live.',
          'Before them, people used candles and oil lamps.',
          'Now we can read, cook, and play long after dark.',
          'A tiny glass bulb made the night much brighter for everyone.'
        ],
        free: [],
        question: 'What does the last sentence do?',
        choices: [
          'It sums up how much the light bulb helped.',
          'It tells how candles were made long ago.',
          'It says candles are still the best light.'
        ],
        answer: 0,
        why: 'It brings the details together to show the big change bulbs made.'
      },
      {
        id: 'conclusion-09',
        parts: [
          'Our class spent Saturday cleaning up the beach.',
          'We picked up bottles, wrappers, and old fishing line.',
          'We filled twelve big bags by lunchtime.',
          'Now the sand is clean, and the sea creatures are safer.'
        ],
        free: [],
        question: 'Which idea does the paragraph end on?',
        choices: [
          'The cleanup made the beach better for sea life.',
          'The class filled twelve bags by lunch.',
          'The beach should be cleaned every Saturday.'
        ],
        answer: 0,
        why: 'The last sentence tells the good result of all the hard work.'
      },
      {
        id: 'conclusion-10',
        parts: [
          'Rainy days can still be full of fun.',
          'You can build a blanket fort in the living room.',
          'You can bake cookies or do a giant puzzle.',
          'So the next time it rains, try something new indoors!'
        ],
        free: [[1, 2]],
        question: 'What does the last sentence do?',
        choices: [
          'It cheers readers on to enjoy rainy days.',
          'It adds another indoor game to play.',
          'It says rainy days are better than sunny ones.'
        ],
        answer: 0,
        why: 'It encourages readers to have fun when it rains.'
      }
    ]
  }
];
