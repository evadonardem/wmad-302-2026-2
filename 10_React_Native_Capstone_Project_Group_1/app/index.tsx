/**
 * Root route ("/") - send everyone to the shop. The (app) layout's auth guard
 * redirects to the login screen when there is no session.
 */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(app)/(tabs)/home" />;
}
