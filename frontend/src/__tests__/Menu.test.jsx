import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Menu from '../pages/public/Menu'

vi.mock('../services/api', () => ({
  fetchMenu: async () => [
    { _id: '1', name: 'Pizza', category: 'Main', price: 10 },
    { _id: '2', name: 'Pasta', category: 'Main', price: 8 }
  ]
}))

describe('Menu page', ()=>{
  it('renders items from API', async ()=>{
    render(<Menu />)
    expect(screen.getByText(/Loading menu/i)).toBeInTheDocument()
    await waitFor(()=> expect(screen.getByText('Pizza')).toBeInTheDocument())
    expect(screen.getByText('Pasta')).toBeInTheDocument()
  })
})
