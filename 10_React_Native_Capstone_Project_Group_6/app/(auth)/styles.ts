/**
 * Shared Styles for Auth Screens
 */
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.primaryText,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 4,
  },
  card: {
    borderRadius: 12,
    padding: 0,
  },
  cardContent: {
    padding: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 28,
  },
  input: {
    marginBottom: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  eyeText: {
    fontSize: 20,
  },
  errorContainer: {
    backgroundColor: colors.errorContainer,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
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
    color: colors.textMuted,
  },
  link: {
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 14,
    color: colors.primaryText,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
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
    color: colors.text,
    marginBottom: 8,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  genderOptionTextSelected: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
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
    color: colors.textMuted,
  },
  guideContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: colors.textBody,
    lineHeight: 20,
  },
});