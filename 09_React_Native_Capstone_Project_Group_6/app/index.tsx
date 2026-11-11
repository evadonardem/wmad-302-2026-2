import { Redirect } from 'expo-router';

// "/" has no screen of its own, so send everyone to Home.
// If they aren't logged in, the guard in app/(app)/_layout.tsx
// bounces them on to /login.
export default function Index() {
    return <Redirect href="/(app)/(tabs)/home" />;
}