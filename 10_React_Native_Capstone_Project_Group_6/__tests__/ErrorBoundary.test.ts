import { ErrorBoundary } from '@/components/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('turns a thrown error into state', () => {
    const error = new Error('Boom');
    expect(ErrorBoundary.getDerivedStateFromError(error)).toEqual({ error });
  });

  it('shows the children when nothing went wrong', () => {
    const boundary = new ErrorBoundary({ children: 'hello' });
    expect(boundary.render()).toBe('hello');
  });

  it('shows the fallback screen once there is an error', () => {
    const boundary = new ErrorBoundary({ children: 'hello' });
    boundary.state = { error: new Error('Boom') };
    const screen = boundary.render() as { props: { accessibilityRole: string } };
    expect(screen.props.accessibilityRole).toBe('alert');
  });

  it('logs the error and reports it to onError', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const onError = jest.fn();
    const boundary = new ErrorBoundary({ children: null, onError });
    const error = new Error('Boom');

    boundary.componentDidCatch(error, { componentStack: 'at Screen' });
    expect(consoleError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(error, { componentStack: 'at Screen' });
    consoleError.mockRestore();
  });
});
