import { playableLessons } from '../src/data/lessons';
import { ARTICLES } from '../src/data/constants';

const errors: string[] = [];
const lessonIds = new Set<string>();
const exerciseIds = new Set<string>();
const wordIds = new Set<string>();
let multipleChoiceCount = 0;
let correctChoiceFirstCount = 0;

const assertUnique = (set: Set<string>, id: string, label: string) => {
  if (set.has(id)) {
    errors.push('Duplicate ' + label + ' id: ' + id);
    return;
  }

  set.add(id);
};

for (const lesson of playableLessons) {
  assertUnique(lessonIds, lesson.id, 'lesson');

  if (!lesson.titleTr || !lesson.titleDe || !lesson.goalTr) {
    errors.push('Lesson missing titleTr/titleDe/goalTr: ' + lesson.id);
  }

  if (lesson.baseExercises.length < 8 || lesson.baseExercises.length > 15) {
    errors.push('Lesson must have 8-15 exercises: ' + lesson.id + ' has ' + lesson.baseExercises.length);
  }

  if (!lesson.speakingPrompt) {
    errors.push('Lesson missing speakingPrompt: ' + lesson.id);
  }

  if (!lesson.writingPrompt) {
    errors.push('Lesson missing writingPrompt: ' + lesson.id);
  }

  if (!lesson.reviewSummaryTr) {
    errors.push('Lesson missing reviewSummaryTr: ' + lesson.id);
  }

  if (lesson.vocabulary.length === 0) {
    errors.push('Lesson missing vocabulary: ' + lesson.id);
  }

  for (const word of lesson.vocabulary) {
    assertUnique(wordIds, word.id, 'vocabulary');

    if (word.lessonId !== lesson.id) {
      errors.push('Vocabulary lessonId mismatch: ' + word.id);
    }

    if (word.article && !ARTICLES.includes(word.article)) {
      errors.push('Invalid article on ' + word.id + ': ' + word.article);
    }

    if (!word.example && !word.exampleDe) {
      errors.push('Vocabulary missing exampleDe/example: ' + word.id);
    }
  }

  for (const exercise of lesson.baseExercises) {
    assertUnique(exerciseIds, exercise.id, 'exercise');

    if (exercise.lessonId !== lesson.id) {
      errors.push('Exercise lessonId mismatch: ' + exercise.id);
    }

    if (!exercise.explanation?.trim()) {
      errors.push('Exercise missing Turkish explanation: ' + exercise.id);
    }

    if (exercise.type === 'multipleChoice' || exercise.type === 'article' || exercise.type === 'fillBlank' || exercise.type === 'listening') {
      if (exercise.choices?.length) {
        multipleChoiceCount += 1;

        const choiceIds = new Set<string>();
        for (const choice of exercise.choices) {
          if (choiceIds.has(choice.id)) {
            errors.push('Duplicate choice id in exercise: ' + exercise.id + ' -> ' + choice.id);
          }

          choiceIds.add(choice.id);

          if (!choice.text.trim()) {
            errors.push('Empty choice text in exercise: ' + exercise.id);
          }
        }

        if (!exercise.correctChoiceId) {
          errors.push('Choice exercise missing correctChoiceId: ' + exercise.id);
        }

        const matchingChoice = exercise.choices.find((choice) => choice.id === exercise.correctChoiceId);

        if (!matchingChoice) {
          errors.push('correctChoiceId does not exist in choices: ' + exercise.id);
        }

        if (matchingChoice?.text !== exercise.correctAnswer) {
          errors.push('correctChoiceId text does not match correctAnswer: ' + exercise.id);
        }

        if (exercise.choices[0]?.id === exercise.correctChoiceId) {
          correctChoiceFirstCount += 1;
        }
      } else {
        errors.push('Choice exercise missing choices: ' + exercise.id);
      }
    }

    if (exercise.type === 'sentenceBuild') {
      if (!exercise.buildWords?.length) {
        errors.push('Sentence build missing buildWords: ' + exercise.id);
      }

      if ((exercise.buildWords?.length ?? 0) < 3) {
        errors.push('Sentence build needs at least 3 tokens: ' + exercise.id);
      }

      const normalizedCorrect = exercise.correctAnswer.replace(/[.!?]/g, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('de-DE');
      const normalizedWords = (exercise.buildWords ?? []).join(' ').replace(/[.!?]/g, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('de-DE');

      for (const token of normalizedCorrect.split(' ')) {
        if (token && !normalizedWords.includes(token)) {
          errors.push('Sentence build missing token "' + token + '": ' + exercise.id);
          break;
        }
      }
    }

    if (exercise.type === 'translation' && (!exercise.acceptedAnswers || exercise.acceptedAnswers.length === 0)) {
      errors.push('Translation exercise missing acceptedAnswers: ' + exercise.id);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  lessons: playableLessons.length,
  exercises: exerciseIds.size,
  vocabulary: wordIds.size,
  multipleChoiceLike: multipleChoiceCount,
  correctChoiceFirstInSource: correctChoiceFirstCount,
  note: 'Choice display order is shuffled at render/session by choiceUtils; scoring uses correctChoiceId.',
}, null, 2));
