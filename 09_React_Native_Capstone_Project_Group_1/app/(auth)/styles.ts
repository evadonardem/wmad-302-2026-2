/**
 * Shared Styles for Auth Screens
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    // Keep the form phone-width on tablets / desktop browsers
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
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
    color: colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: colors.textMuted,
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
    backgroundColor: colors.errorLight,
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
  demoContainer: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  demoButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
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
    color: colors.primary,
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

  // ---- Register screen styles ----
  // On narrow phones the two fields don't fit side by side, so they stack
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
  },
  halfInput: {
    flex: 1,
    minWidth: 140,
  },
  optionalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    alignItems: 'flex-start',
  },
  genderSelector: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderOptionText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  genderOptionTextSelected: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    margin: 0,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    height: 52,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  loginText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  guideContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  guideText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
});