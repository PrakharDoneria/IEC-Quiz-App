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
  duration: number; // Duration in seconds
};

export type Result = {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  schoolName: string;
  score: number;
  total: number;
  createdAt: any;
};

export type UserProfile = {
    uid: string;
    name: string;
    email: string;
    schoolName: string;
    mobile: string;
    role: 'student' | 'admin';
}
