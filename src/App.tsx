import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs"; // ◀◀◀ この行を追加
// ... (既存の import は変更なし)
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faFaceGrinWide,
  faTrash,
  faThumbtack,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { initTodos } from "./initTodos";
import { v4 as uuid } from "uuid";
import Draggable, { type DraggableEvent, type DraggableData } from "react-draggable";
import type { Todo } from "./types";

// ... (getPriorityColor, DraggableTodoItem は変更なし) ...
const getPriorityColor = (priority: number): string => {
  switch (priority) {
    case 1:
      return "bg-red-300";
    case 2:
      return "bg-yellow-200";
    case 3:
      return "bg-green-200";
    case 4:
      return "bg-blue-200";
    default:
      return "bg-gray-200";
  }
};

type DraggableTodoItemProps = {
  todo: Todo;
  onDragStart: (id: string) => void;
  onDragStop: (id: string, e: DraggableEvent, data: DraggableData) => void;
  onToggleDone: (id: string) => void;
  zIndex: number;
};

const DraggableTodoItem = ({
  todo,
  onDragStart,
  onDragStop,
  onToggleDone,
  zIndex,
}: DraggableTodoItemProps) => {
  const nodeRef = useRef(null);

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    onDragStop(todo.id, e, data);
  };

  const now = new Date();
  const isOverdue = todo.deadline && todo.deadline < now && !todo.isDone;

  return (
    <Draggable
      bounds="parent"
      nodeRef={nodeRef}
      position={{ x: todo.x, y: todo.y }}
      onStart={() => onDragStart(todo.id)}
      onStop={handleDragStop}
    >
      <div
        ref={nodeRef}
        className={twMerge(
          "relative transform cursor-move rounded-md border border-gray-400 p-3 shadow-lg box-border",
          "w-64 min-h-[150px]",
          getPriorityColor(todo.priority),
          todo.isDone && "bg-gray-300 opacity-70 line-through grayscale",
          isOverdue && "border-2 border-orange-600"
        )}
        style={{
          position: "absolute",
          transform: `rotate(${todo.rotate}deg)`,
          zIndex: zIndex,
        }}
      >
        <FontAwesomeIcon
          icon={faThumbtack}
          className="absolute -top-3 -left-2 text-xl text-gray-600"
          style={{ transform: "rotate(-40deg)" }}
        />
        <FontAwesomeIcon
          icon={faThumbtack}
          className="absolute -top-3 -right-2 text-xl text-gray-600"
          style={{ transform: "rotate(30deg)" }}
        />

        {todo.isDone && (
          <div className="mb-2 rounded bg-gray-500 px-2 py-0.5 text-center text-xs text-white">
            <FontAwesomeIcon icon={faFaceGrinWide} className="mr-1.5" />
            完了済み
          </div>
        )}

        {isOverdue && (
          <div className="mb-2 rounded bg-orange-500 px-2 py-0.5 text-center text-xs text-white">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1.5" />
            期限切れ
          </div>
        )}

        <div className="flex flex-row items-center text-slate-800">
          <input
            type="checkbox"
            checked={todo.isDone}
            onChange={() => onToggleDone(todo.id)}
            onMouseDown={(e) => e.stopPropagation()}
            className="mr-2 h-5 w-5 flex-shrink-0"
          />
          <div
            className={twMerge(
              "text-lg font-bold",
              todo.isDone && "line-through decoration-2"
            )}
          >
            {todo.name}
          </div>
          <div className="ml-auto font-mono text-lg text-orange-600">
            {num2star(todo.priority)}
          </div>
        </div>

        {todo.deadline && (
          <div className="mt-2 flex items-center text-sm text-slate-600">
            <FontAwesomeIcon
              icon={faClock}
              flip="horizontal"
              className="mr-1.5"
            />
            <div className={twMerge(todo.isDone && "line-through")}>
              期限: {dayjs(todo.deadline).format("YYYY年M月D日 H時m分")}
            </div>
          </div>
        )}
      </div>
    </Draggable>
  );
};


// ----------------------------------------------------------------
// ★ TodoList (レイアウトクラスを削除)
// ----------------------------------------------------------------
type TodoListProps = {
  todos: Todo[];
  onDragStart: (id: string) => void;
  onDragStop: (id: string, e: DraggableEvent, data: DraggableData) => void;
  onToggleDone: (id: string) => void;
};

const TodoList = (props: TodoListProps) => {
  const { todos, onDragStart, onDragStop, onToggleDone } = props;

  const priorityMultiplier = todos.length;

  return (
    // ◀◀◀ h-screen, p-8, overflow-hidden を削除し、h-full, w-full, relative のみに
    <div className="relative h-full w-full"> 
      {todos.length === 0 && (
        <div className="text-center text-gray-500 pt-10">
          登録されているタスクはありません。
        </div>
      )}
      {todos.map((todo, index) => {
        const zIndex = (5 - todo.priority) * priorityMultiplier + index;

        return (
          <DraggableTodoItem
            key={todo.id}
            todo={todo}
            onDragStart={onDragStart}
            onDragStop={onDragStop}
            onToggleDone={onToggleDone}
            zIndex={zIndex}
          />
        );
      })}
    </div>
  );
};

const num2star = (n: number): string => "★".repeat(4 - n);

// ----------------------------------------------------------------
// ★ App (レイアウトを flex flex-col に変更)
// ----------------------------------------------------------------
const App = () => {
  // ... (useState, useEffect, handleSubmit, ドラッグハンドラ等は変更なし) ...
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      const parsed = JSON.parse(savedTodos) as Todo[];
      return parsed.map((todo) => ({
        ...todo,
        deadline: todo.deadline ? new Date(todo.deadline) : null,
      }));
    } else {
      return initTodos.map((todo, index) => ({
        ...todo,
        x: (index * 60) % 500 + 30,
        y: Math.floor(index / 8) * 70 + 30,
        rotate: Math.random() * 10 - 5,
      }));
    }
  });

  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState(2);
  const [deadlineInput, setDeadlineInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const trashAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName === "") return;
    const newRotate = Math.random() * 10 - 5;
    const newX = Math.random() * 300 + 50;
    const newY = Math.random() * 200 + 50;
    const newDeadline = deadlineInput === "" ? null : new Date(deadlineInput);

    const newTask: Todo = {
      id: uuid(),
      name: taskName,
      isDone: false,
      priority: priority,
      deadline: newDeadline,
      x: newX,
      y: newY,
      rotate: newRotate,
    };
    setTodos([...todos, newTask]);
    setTaskName("");
    setPriority(2);
    setDeadlineInput("");
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = (id: string, e: DraggableEvent, data: DraggableData) => {
    setIsDragging(false);

    if (!trashAreaRef.current) return;
    const trashRect = trashAreaRef.current.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if ((e as TouchEvent).changedTouches) {
      clientX = (e as TouchEvent).changedTouches[0].clientX;
      clientY = (e as TouchEvent).changedTouches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    const isOverTrash =
      clientX >= trashRect.left &&
      clientX <= trashRect.right &&
      clientY >= trashRect.top &&
      clientY <= trashRect.bottom;

    if (isOverTrash) {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } else {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, x: data.x, y: data.y } : todo
        )
      );
    }
  };

  const handleToggleDone = (id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      )
    );
  };

  return (
    <div
      // ◀◀◀ h-screen, overflow-hidden, flex flex-col を追加
      className="h-screen w-full bg-cover bg-fixed bg-center overflow-hidden flex flex-col"
      style={{
        backgroundImage: "url('/koruku.jpg')",
      }}
    >
      {/* ◀◀◀ container を削除、pt-4 を追加 */}
      <h1 className="mb-4 text-center text-3xl font-bold text-gray-700 pt-4">
        宿題管理ノート
      </h1>

      <form
        onSubmit={handleSubmit}
        // ◀◀◀ フォームを中央寄せ
        className="sticky top-4 z-10 mb-8 rounded-lg border border-gray-400 bg-amber-100 p-4 shadow-lg mx-auto w-11/12 max-w-3xl"
      >
        {/* ... (フォームの中身は変更なし) ... */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-grow">
              <label
                htmlFor="taskName"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                新しい宿題:
              </label>
              <input
                id="taskName"
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full rounded-md border-b-2 border-dashed border-gray-400 bg-transparent px-3 py-2 text-gray-800 focus:outline-none focus:border-yellow-500"
                placeholder="例: 解析2の宿題"
              />
            </div>
            <div className="md:w-32">
              <label
                htmlFor="priority"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                優先度:
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full appearance-none rounded-md border-b-2 border-dashed border-gray-400 bg-transparent px-3 py-2 text-gray-800 focus:outline-none focus:border-yellow-500"
              >
                <option value={1}>1 (最高)</option>
                <option value={2}>2 (高)</option>
                <option value={3}>3 (中)</option>
                <option value={4}>4 (低)</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-grow">
              <label
                htmlFor="deadline"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                期限 (任意):
              </label>
              <input
                id="deadline"
                type="datetime-local"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className="w-full rounded-md border-b-2 border-dashed border-gray-400 bg-transparent px-3 py-2 text-gray-800 focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div className="md:w-32">
              <button
                type="submit"
                className="h-10 w-full rounded-full border border-yellow-700 bg-yellow-400 px-6 py-2 font-bold text-white shadow-md transition-colors hover:bg-yellow-500"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ◀◀◀ TodoList をラップし、残りの高さを占めるドラッグ領域に */}
      <div className="flex-grow relative p-8 overflow-hidden">
        <TodoList
          todos={todos}
          onDragStart={handleDragStart}
          onDragStop={handleDragStop}
          onToggleDone={handleToggleDone}
        />
      </div>

      <div
        ref={trashAreaRef}
        className={twMerge(
          "fixed bottom-8 right-8 z-20 flex h-32 w-32 items-center justify-center rounded-full bg-gray-400 text-white shadow-lg transition-all duration-300",
          isDragging && "scale-125 bg-red-500"
        )}
      >
        <FontAwesomeIcon icon={faTrash} size="3x" />
      </div>
    </div>
  );
};

export default App;