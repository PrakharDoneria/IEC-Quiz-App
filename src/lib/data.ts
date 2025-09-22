export type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

export type Quiz = {
  id: string;
  code: string;
  title: string;
  questions: Question[];
};

export type Result = {
  id: string;
  quizId: string;
  studentName: string;
  schoolName: string;
  email: string;
  mobile: string;
  score: number;
};

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: '1',
    code: 'MATH101',
    title: 'Basic Algebra',
    questions: [
      { id: 'q1', question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: '4' },
      { id: 'q2', question: 'What is 5 * 8?', options: ['30', '35', '40', '45'], correctAnswer: '40' },
      { id: 'q3', question: 'What is 10 / 2?', options: ['2', '4', '5', '8'], correctAnswer: '5' },
    ],
  },
  {
    id: '2',
    code: 'SCI202',
    title: 'General Science',
    questions: [
      { id: 'q1', question: 'What is the chemical symbol for water?', options: ['H2O', 'CO2', 'O2', 'NaCl'], correctAnswer: 'H2O' },
      { id: 'q2', question: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Mars' },
    ],
  },
];

export const MOCK_RESULTS: Result[] = [
  { id: 'r1', quizId: '1', studentName: 'Alice', schoolName: 'Springfield High', email: 'alice@example.com', mobile: '1112223331', score: 3 },
  { id: 'r2', quizId: '1', studentName: 'Bob', schoolName: 'Springfield High', email: 'bob@example.com', mobile: '1112223332', score: 2 },
  { id: 'r3', quizId: '1', studentName: 'Charlie', schoolName: 'Shelbyville High', email: 'charlie@example.com', mobile: '1112223333', score: 3 },
  { id: 'r4', quizId: '1', studentName: 'Diana', schoolName: 'Springfield High', email: 'diana@example.com', mobile: '1112223334', score: 1 },
  { id: 'r5', quizId: '1', studentName: 'Eve', schoolName: 'Shelbyville High', email: 'eve@example.com', mobile: '1112223335', score: 2 },
  { id: 'r6', quizId: '1', studentName: 'Frank', schoolName: 'Capital City Prep', email: 'frank@example.com', mobile: '1112223336', score: 3 },
  { id: 'r7', quizId: '1', studentName: 'Grace', schoolName: 'Capital City Prep', email: 'grace@example.com', mobile: '1112223337', score: 2 },
  { id: 'r8', quizId: '1', studentName: 'Heidi', schoolName: 'Capital City Prep', email: 'heidi@example.com', mobile: '1112223338', score: 1 },
  { id: 'r9', quizId: '1', studentName: 'Ivan', schoolName: 'Springfield High', email: 'ivan@example.com', mobile: '1112223339', score: 3 },
];
