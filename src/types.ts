export type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: Date | null;
  description: string;
  x: number;
  y: number;
  rotate: number;
};