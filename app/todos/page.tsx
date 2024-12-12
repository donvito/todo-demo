'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Edit2, X, Check } from 'lucide-react'

interface Todo {
  id: number
  text: string
  completed: boolean
  isEditing?: boolean
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [editText, setEditText] = useState<{[key: number]: string}>({})

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    const response = await fetch('/api/todos')
    const data = await response.json()
    setTodos(data)
  }

  const addTodo = async () => {
    if (newTodo.trim() !== '') {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTodo }),
      })
      const data = await response.json()
      setTodos([...todos, { ...data, isEditing: false }])
      setNewTodo('')
    }
  }

  const toggleTodo = async (id: number) => {
    const todoToUpdate = todos.find(todo => todo.id === id)
    if (todoToUpdate) {
      const response = await fetch('/api/todos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, text: todoToUpdate.text, completed: !todoToUpdate.completed }),
      })
      const updatedTodo = await response.json()
      setTodos(todos.map(todo => todo.id === id ? { ...updatedTodo, isEditing: false } : todo))
    }
  }

  const deleteTodo = async (id: number) => {
    await fetch('/api/todos', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const startEditing = (id: number, text: string) => {
    setEditText({...editText, [id]: text})
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, isEditing: true } : todo
    ))
  }

  const cancelEditing = (id: number) => {
    const newEditText = {...editText}
    delete newEditText[id]
    setEditText(newEditText)
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, isEditing: false } : todo
    ))
  }

  const saveEdit = async (id: number) => {
    const newText = editText[id]
    if (!newText || newText.trim() === '') return

    const response = await fetch('/api/todos', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, text: newText }),
    })
    const updatedTodo = await response.json()
    
    const newEditText = {...editText}
    delete newEditText[id]
    setEditText(newEditText)
    
    setTodos(todos.map(todo => todo.id === id ? { ...updatedTodo, isEditing: false } : todo))
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Todo List</h1>
      <div className="flex mb-4">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          className="mr-2"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <Button onClick={addTodo}>Add</Button>
      </div>
      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
            <div className="flex items-center flex-grow mr-2">
              <Checkbox
                id={`todo-${todo.id}`}
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
                className="mr-2"
              />
              {todo.isEditing ? (
                <Input
                  type="text"
                  value={editText[todo.id]}
                  onChange={(e) => setEditText({...editText, [todo.id]: e.target.value})}
                  className="flex-grow"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      saveEdit(todo.id)
                    }
                  }}
                />
              ) : (
                <label
                  htmlFor={`todo-${todo.id}`}
                  className={`${todo.completed ? 'line-through text-gray-500' : ''} flex-grow`}
                >
                  {todo.text}
                </label>
              )}
            </div>
            <div className="flex">
              {todo.isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => saveEdit(todo.id)}
                    className="text-green-500 hover:text-green-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => cancelEditing(todo.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(todo.id, todo.text)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
