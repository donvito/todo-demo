import { NextResponse } from 'next/server'
import { getDb } from '@/app/lib/db'

export async function GET() {
  const db = await getDb()
  const todos = await db.all('SELECT * FROM todos ORDER BY created_at DESC')
  return NextResponse.json(todos)
}

export async function POST(request: Request) {
  const { text } = await request.json()
  const db = await getDb()
  
  const result = await db.run(
    'INSERT INTO todos (text) VALUES (?)',
    text
  )

  const newTodo = await db.get('SELECT * FROM todos WHERE id = ?', result.lastID)
  return NextResponse.json(newTodo)
}

export async function PUT(request: Request) {
  const { id, text } = await request.json()
  const db = await getDb()
  
  await db.run(
    'UPDATE todos SET text = ? WHERE id = ?',
    text,
    id
  )

  const updatedTodo = await db.get('SELECT * FROM todos WHERE id = ?', id)
  return NextResponse.json(updatedTodo)
}

export async function DELETE(request: Request) {
  // Check if the request body is empty
  const body = await request.json().catch(() => null);
  if (!body || !body.id) {
    return NextResponse.json({ error: 'No valid ID provided' }, { status: 400 });
  }

  const { id } = body;
  const db = await getDb();
  
  await db.run('DELETE FROM todos WHERE id = ?', id);
  return NextResponse.json({ success: true });
}

