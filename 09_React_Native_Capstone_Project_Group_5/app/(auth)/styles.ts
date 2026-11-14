/**
 * Shared Styles for Auth Screens
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
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
  logoText: {
    fontSize: 64,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E85D04',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#8D6E63',
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    padding: 0,
  },
  cardContent: {
    padding: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3E2723',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8D6E63',
    textAlign: 'center',
    marginBottom: 28,
  },
  input: {
    marginBottom: 16,
  },
  savedUsernameHint: {
    color: '#8D6E63',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },
  fieldError: {
    color: '#C62828',
    fontSize: 12,
    lineHeight: 16,
    marginTop: -12,
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
    marginBottom: 16,
  },
  optionalRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  genderSelector: {
    borderWidth: 1,
    borderColor: '#D7CCC8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  genderLabel: {
    color: '#8D6E63',
    fontSize: 12,
    marginBottom: 8,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#FFE0B2',
  },
  genderOptionText: {
    fontSize: 12,
    color: '#3E2723',
  },
  genderOptionTextSelected: {
    color: '#E85D04',
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 8,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 18,
  },
  eyeIcon: {
    padding: 8,
  },
  eyeText: {
    fontSize: 20,
  },
  passwordStrength: {
    marginTop: -8,
    marginBottom: 16,
  },
  strengthTrack: {
    height: 5,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: '#EFEBE9',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#8D6E63',
  },
  errorContainer: {
    backgroundColor: '#FDEDED',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    height: 52,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    height: 52,
  },
  buttonContent: {
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#8D6E63',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#8D6E63',
  },
  link: {
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#E85D04',
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8D6E63',
    textAlign: 'center',
    lineHeight: 18,
  },
  guideContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3E2723',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 12,
    color: '#5D4037',
    lineHeight: 18,
  },
});