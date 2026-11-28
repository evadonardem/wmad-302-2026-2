/**
 * Shared Styles for Auth Screens
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 128,
    height: 128,
    marginBottom: 8,
  },
  appName: {
    fontFamily: 'monospace',
    fontSize: 32,
    fontWeight: '700',
    color: '#59486F',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 16,
    color: '#5F6368',
    marginTop: 4,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    borderRadius: 12,
    padding: 0,
  },
  cardContent: {
    padding: 28,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#5F6368',
    textAlign: 'center',
    marginBottom: 28,
  },
  input: {
    marginBottom: 16,
  },
  passwordHint: {
    color: '#746C7A',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  eyeText: {
    fontSize: 20,
  },
  errorContainer: {
    backgroundColor: '#FCE8E6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EA4335',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
    height: 52,
  },
  buttonContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  registerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#5F6368',
  },
  link: {
    paddingHorizontal: 4,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#75648A',
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 18,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionalRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  halfInput: {
    flex: 1,
  },
  genderSelector: {
    justifyContent: 'center',
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 8,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: '#75648A',
    backgroundColor: '#F2EEF5',
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5F6368',
  },
  genderOptionTextSelected: {
    color: '#75648A',
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 4,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#5F6368',
    lineHeight: 20,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
    height: 52,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#5F6368',
  },
  guideContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F2EEF5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCD4E5',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#75648A',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: '#3C4043',
    lineHeight: 20,
  },
});