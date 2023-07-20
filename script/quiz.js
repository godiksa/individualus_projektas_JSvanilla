// Variables
const questionElement = document.querySelector('#questions');
const answerElement = document.querySelector('#answer');

const QUESTIONS_ENDPOINT = './data/questions.json';
const ANSWERS_ENDPOINT = './data/answers.json';

const chosenAnswers = [];
const unansweredQuestions = [];

// Functions
const showQuestions = async () => {
  const questions = await (await fetch(QUESTIONS_ENDPOINT)).json();

  questions.forEach((question) => {
    // creating questions
    const questionBlock = document.createElement('div');
    questionBlock.id = question.id;
    questionBlock.classList.add('question-block', 'question-' + question.id);

    // --creating question at top
    const titleBlock = document.createElement('div');
    titleBlock.id = question.id;
    titleBlock.classList.add('title-block', 'question-title-' + question.id);

    const titleHeading = document.createElement('h2');
    titleHeading.innerText = question.text;
    const titleChoose = document.createElement('p');
    titleChoose.innerText = 'CHOOSE ONE TO CONTINUE';

    titleBlock.append(titleHeading, titleChoose);

    // --creating answer options
    const answersBlock = document.createElement('div');
    answersBlock.id = question.id + '-questions';
    answersBlock.classList.add('answer-options', 'answer-' + question.id);

    question.answers.forEach((answer) => {
      const answerBlock = document.createElement('div');
      answerBlock.classList.add('answer-block');

      //--logic for tracking chosen answers and changing them
      answerBlock.addEventListener('click', () =>
        handleAnswerSelection(question.id, answer.text, answer.value)
      );

      // ----creating images
      if (answer.image) {
        const answerImage = document.createElement('img');
        answerImage.setAttribute('src', answer.image);

        answerBlock.append(answerImage);
      }

      // ----creating icons
      if (answer.icon) {
        const answerIcon = document.createElement('i');
        answerIcon.classList.add(answer.icon[0], answer.icon[1]);

        answerBlock.append(answerIcon);
      }

      // ----creating h2 for budget amounts
      if (answer.amount) {
        const budgetAmounts = document.createElement('h2');
        budgetAmounts.innerText = answer.amount;

        answerBlock.append(budgetAmounts);
      }

      // creating answer descriptions
      if (answer.description) {
        const descriptionText = document.createElement('p');
        descriptionText.innerText = answer.description;

        answerBlock.append(descriptionText);
      }

      // creating answer title
      const answerTitle = document.createElement('h3');
      answerTitle.innerText = answer.text;

      answerBlock.append(answerTitle);

      answersBlock.append(answerBlock);
    });

    // --creating button
    const nextButton = document.createElement('button');
    nextButton.id = question.id;
    nextButton.classList.add('hidden', 'btn');
    nextButton.innerText = 'SELECT';
    nextButton.addEventListener('click', () => handleNextBtn());

    questionBlock.append(titleBlock, answersBlock, nextButton);
    questionElement.appendChild(questionBlock);

    // Hide all questions except the first one
    if (question.id !== questions[0].id) {
      questionBlock.classList.add('hidden-question-blocks');
    }

    // adding all question ids to an unanswered array
    unansweredQuestions.push(question.id);
  });
};

const handleAnswerSelection = (questionId, answerText, answerValue) => {
  const currentQuestionBlock = document.getElementById(
    questionId + '-questions'
  );

  if (unansweredQuestions.includes(questionId)) {
    chosenAnswers.push(answerValue ? answerValue : answerText);

    const questionIdToRemove = unansweredQuestions.indexOf(questionId);
    if (questionIdToRemove > -1) {
      unansweredQuestions.splice(questionIdToRemove, 1);
    }
  } else {
    if (currentQuestionBlock.children.length <= 10) {
      chosenAnswers.splice(
        questionId,
        1,
        answerValue ? answerValue : answerText
      );
    } else {
      const existingAnswerId = chosenAnswers.findIndex(
        (answer) =>
          answer.toUpperCase() ===
          (answerValue ? answerValue.toUpperCase() : answerText.toUpperCase())
      );

      if (existingAnswerId > -1) {
        chosenAnswers.splice(existingAnswerId, 1);
      }

      if (existingAnswerId === -1) {
        chosenAnswers.push(answerValue ? answerValue : answerText);
      }
    }
  }
  console.log(answerValue ? answerValue : answerText, chosenAnswers); // REMOVE LATER
  console.log(questionId, unansweredQuestions); // REMOVE LATER

  const wrapperCurrentQuestionBlock = document.querySelector(
    '.question-' + questionId
  );
  wrapperCurrentQuestionBlock.lastChild.classList.remove('hidden');

  disableQuestionBlock(questionId, answerText);
};

const disableQuestionBlock = (questionId, chosenAnswer) => {
  const currentQuestionBlock = document.getElementById(
    questionId + '-questions'
  );

  if (currentQuestionBlock.children.length < 10) {
    Array.from(currentQuestionBlock.children).forEach((block) => {
      if (block.classList.contains('blocked')) {
        block.classList.remove('blocked', 'clicked');
      }

      if (
        block.lastChild.innerText.toUpperCase() === chosenAnswer.toUpperCase()
      ) {
        block.classList.add('clicked');
      } else {
        block.classList.add('blocked');
      }
    });
  } else {
    Array.from(currentQuestionBlock.children).forEach((block) => {
      if (
        block.classList.contains('clicked') &&
        block.lastChild.innerText.toUpperCase() === chosenAnswer.toUpperCase()
      ) {
        block.classList.remove('clicked');
      } else if (
        block.lastChild.innerText.toUpperCase() === chosenAnswer.toUpperCase()
      ) {
        block.classList.add('clicked');
      }
    });
  }
};

const handleNextBtn = () => {
  const lowestQuestionId = Math.min(...unansweredQuestions);
  const nextQuestionBlock = document.querySelector(
    `.question-${lowestQuestionId}`
  );

  const currentQuestionId = lowestQuestionId.toString() - 1;
  const wrapperCurrentQuestionBlock = document.querySelector(
    '.question-' + currentQuestionId
  );

  if (unansweredQuestions.length) {
    // unhide the next unanswered questiona and go to it's location
    nextQuestionBlock.classList.remove('hidden-question-blocks');
    location.href = '#' + lowestQuestionId;

    wrapperCurrentQuestionBlock.lastChild.innerText = 'UPDATE';
  } else {
    showFinalAnswer();
  }
};

const showFinalAnswer = async () => {
  const answers = await (await fetch(ANSWERS_ENDPOINT)).json();

  while (answerElement.firstChild) {
    answerElement.removeChild(answerElement.firstChild);
  }

  let results;
  const pointsArray = [];

  const filteredAnswers = answers.filter(({ distance, price, time }) => {
    const priceOptions =
      price === 'Cheap'
        ? ['Luxury', 'Mid-Grade', 'Cheap']
        : price === 'Mid-Grade'
        ? ['Luxury', 'Mid-Grade']
        : [price];
    const timeOptions =
      time === 'ALL' || time === 'Weekend'
        ? ['Month+', '1-2 weeks', 'Weekend']
        : time === '1-2 weeks'
        ? ['Month+', '1-2 weeks']
        : [time];

    return (
      chosenAnswers.includes(distance) &&
      (priceOptions.includes('Cheap') ||
        priceOptions.includes('Mid-Grade') ||
        chosenAnswers.includes(price)) &&
      (timeOptions.includes('ALL') ||
        timeOptions.includes('Weekend') ||
        timeOptions.includes('1-2 weeks') ||
        chosenAnswers.includes(time))
    );
  });
  // console.log(filteredAnswers);

  filteredAnswers.forEach((answer) => {
    chosenAnswers.forEach((chosenAnswer) => {
      const lowercaseAnswer = chosenAnswer.toLowerCase();
      const existingPoint = pointsArray.find(
        (x) => x.location === answer.display.text
      );

      if (!existingPoint) {
        if (
          answer.hasOwnProperty(lowercaseAnswer) &&
          answer[lowercaseAnswer] !== 0
        ) {
          const answerDetail = {
            location: answer.display.text,
            points: answer[lowercaseAnswer],
            [lowercaseAnswer]: answer[lowercaseAnswer],
          };
          pointsArray.push(answerDetail);
        }
      } else {
        if (
          answer.hasOwnProperty(lowercaseAnswer) &&
          answer[lowercaseAnswer] !== 0
        ) {
          existingPoint.points += answer[lowercaseAnswer];
          existingPoint[lowercaseAnswer] = answer[lowercaseAnswer];
        }
      }
    });

    if (!results) {
      // first answer object is default
      results = answers[(0, 1, 2)];
    } else {
      const sortedPoints = pointsArray.sort((a, b) => b.points - a.points);
      const sortedLength = sortedPoints.sort(
        (a, b) => Object.keys(b).length - Object.keys(a).length
      );
      const filteredResultArray = sortedLength.slice(0, 3);

      const finalResultAnswers = filteredResultArray.reduce(
        (filtered, result) => {
          const matchingAnswers = filteredAnswers.filter((answer) =>
            result.location.includes(answer.display.text)
          );
          return filtered.concat(matchingAnswers);
        },
        []
      );

      results = finalResultAnswers;
    }
  });

  console.log(pointsArray, results);

  const answerBlock = document.createElement('div');
  answerBlock.classList.add('result-block');

  results.forEach((result) => {
    const answerOption = document.createElement('div');
    answerOption.classList.add('result-option');
    const answerTitle = document.createElement('h3');
    answerTitle.innerText = result.display.text;
    const answerImage = document.createElement('img');
    answerImage.setAttribute('src', result.display.image);

    answerOption.append(answerTitle, answerImage);
    answerBlock.appendChild(answerOption);
    answerElement.appendChild(answerBlock);
  });

  location.href = '#answer';
};

// Events
document.addEventListener('DOMContentLoaded', showQuestions());
