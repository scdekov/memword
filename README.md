# Memword [demo](https://memworld.herokuapp.com/)

This project is inspired by an article that I read about [spaced repetition learning](https://en.wikipedia.org/wiki/Spaced_repetition) (I lost the original article). In short, the idea is that there is a perfect moment in time in witch if you recollect given piece of memory, you are making that memory a lot stronger in long term. That moment is determined by the amount of effort that you should put in order to recollect the momory. The bigger the effort of recollecting, the strengthened is the memory.

For example, lets say you are trying to learn a specific word in a new language(makes more sense for many words). If you repeat the word many times on the same day that you read if for the first time, it may look like it's working but in long term this seems like an ineffective method. In oposite, if you wait three or four days until the first repetition, it may be too late, because you already forgot that word. The spaced repetition approach is trying to guess that time after the initial frequent repeating and before you lost that memory, which should be close to the best moment of recollecting it for an effective learning.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Python 3.6.7
* node 8.15.0
* ImageDepot API token
* Oxford dict API key

### Installing

```
git clone git@github.com:scdekov/memword.git
cd memword

pip install -r requirements.txt
npm install
```

### Running the project

```
export IMAGE_DEPOT_API_KEY={...} OXFORD_DICT_APP_ID={...} OXFORD_DICT_APP_KEY={...}  (those can also be added in credentials.py file in the server directory)
npm run watch & python3 manage.py runserver
```

## Running the tests

Run `pytest` command in the project root directory.


## Project development
### Stage 0
Because currently I'm the only user and I'm trying to improve my English vocabulary,
my first goal is to be able to add words with some explanations.
Add those words in lectures/exams which when I'm doing the system will learn by my feedback and
find my best "repetition spaces".

#### Alredy implemented
* Create/delete/edit new cards(words)
* Finding the best image and link it to the card
* Propose card description from dictionary
* Spell correction of the card identifier
* Create/delete/edit lesson from manually selected words
* Logic for adjusting learning intervals when answering/doing a lessons
* Logic for automaticly selecting the "best" words to pick when creating a lesson
* Periodic tasks for adjusting the default intervals for new users/words
* Exams

### Stage 1(TODO)
* Extend the project to be able to add cards with different types of stuff that you want to remember, not only dictionary type words.
* Find better way for associating images with "learning targets"



## Contributing

I'll be happy if anyone want to be part of that project with either implementing any of the currently desired functionalities or giving any ideas for how to improve the project. Contact me if you are one.
