const React = require('react');
require('@testing-library/jest-dom');

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => React.createElement('img', props),
}));

jest.mock('next/link', () => {
jest.mock("lucide-react", () => ({DollarSign: () => null, CalendarDays: () => null, Users: () => null, AlertTriangle: () => null, CheckCircle: () => null, Info: () => null}));
  return ({ children, href }) => React.createElement('a', { href }, children);
});
