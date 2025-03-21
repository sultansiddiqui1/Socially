// route handlers:
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

let tasks: Task[] = [
  { id: 1, title: "learn next.js", completed: false },
  { id: 2, title: "build next.js project ", completed: false },
];

export async function GET() {
  return Response.json(tasks);
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.title) {
      return Response.json({ error: "title is required" }, { status: 400 });
    }
    const newTask: Task = {
      id: tasks.length + 1,
      title: body.title,
      completed: false,
    };
    tasks.push(newTask);
    return Response.json(newTask, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
