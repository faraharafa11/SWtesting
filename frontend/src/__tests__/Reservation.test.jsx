import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Reservations from '../pages/user/Reservations'
import { AuthContext } from '../context/AuthContext'
import { createReservation, getAvailableTables } from '../services/api'

vi.mock('../services/api', () => ({
  getUserReservations: vi.fn().mockResolvedValue([]),
  createReservation: vi.fn().mockResolvedValue({}),
  updateReservation: vi.fn(),
  cancelReservation: vi.fn(),
  getAvailableTables: vi.fn().mockResolvedValue({ availableTables: [5] })
}))

describe('Reservation flow', ()=>{
  it('submits reservation and refreshes list', async ()=>{
    render(
      <AuthContext.Provider value={{ token: 'token', user: { name: 'Guest', email: 'guest@test.com' }, logout: vi.fn() }}>
        <Reservations />
      </AuthContext.Provider>
    )

    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '+1234567890' } })
    fireEvent.change(screen.getByLabelText(/Guests/i), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText(/^Date/i), { target: { value: '2025-12-31' } })
    fireEvent.change(screen.getByLabelText(/^Time/i), { target: { value: '19:30' } })

    await waitFor(()=> expect(getAvailableTables).toHaveBeenCalled())

    fireEvent.change(screen.getByLabelText(/Table/i), { target: { value: '5' } })

    fireEvent.click(screen.getByRole('button', { name: /Create reservation/i }))

    await waitFor(()=> expect(createReservation).toHaveBeenCalled())
  })
})
