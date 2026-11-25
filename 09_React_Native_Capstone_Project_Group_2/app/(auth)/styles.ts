/**
 * Shared Styles for Auth Screens
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F4',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 48,
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E85D04',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: '#6B655F',
    marginTop: 4,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E2DC',
    padding: 0,
  },
  cardContent: {
    padding: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1917',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B655F',
    textAlign: 'center',
    marginBottom: 28,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 8,
  },
  eyeText: {
    fontSize: 18,
  },
  errorContainer: {
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FDA29B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#B42318',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 10,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 10,
  },
  buttonContent: {
    height: 48,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  demoContainer: {
    marginTop: 0,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#E7E2DC',
  },
  demoButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E2DC',
    borderRadius: 10,
  },
  demoButtonText: {
    fontSize: 14,
    color: '#1C1917',
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: '#6B655F',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#6B655F',
  },
  link: {
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#C2410C',
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B655F',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* ---- Used by register.tsx ---- */
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  optionalRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  genderSelector: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 12,
    color: '#6B655F',
    marginBottom: 4,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD8D2',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  genderOptionSelected: {
    borderColor: '#E85D04',
    backgroundColor: '#FFF1EA',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#6B655F',
  },
  genderOptionTextSelected: {
    color: '#C2410C',
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {},
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#6B655F',
  },
});