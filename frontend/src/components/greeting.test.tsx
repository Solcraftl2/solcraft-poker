import { render, screen } from '@testing-library/react'
import Greeting from './greeting'

test('renders greeting', () => {
  render(<Greeting name="Codex" />)
  expect(screen.getByText('Hello Codex')).toBeInTheDocument()
})
