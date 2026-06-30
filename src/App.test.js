import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the job portal app header', () => {
  render(<App />);
  const header = screen.getByText(/JobHub/i);
  expect(header).toBeInTheDocument();
});
