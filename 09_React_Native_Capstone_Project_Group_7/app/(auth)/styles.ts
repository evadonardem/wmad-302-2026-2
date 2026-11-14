/**
 * Shared Styles for Auth Screens - Botanical Sage & Terracotta Theme
 */
import { StyleSheet } from 'react-native';
import { APP_COLORS } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 36,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: APP_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: APP_COLORS.primary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    borderRadius: 20,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  cardContent: {
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 14,
    backgroundColor: APP_COLORS.surfaceElevated,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionalRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  halfInput: {
    flex: 1,
  },
  genderSelector: {
    marginBottom: 14,
  },
  genderLabel: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    backgroundColor: APP_COLORS.surfaceElevated,
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  genderOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_COLORS.textSecondary,
  },
  genderOptionTextSelected: {
    color: '#FFFFFF',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: APP_COLORS.textSecondary,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 6,
    marginBottom: 14,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    backgroundColor: APP_COLORS.primary,
  },
  registerButton: {
    marginTop: 6,
    marginBottom: 14,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    backgroundColor: APP_COLORS.primary,
  },
  buttonContent: {
    height: 52,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  demoContainer: {
    marginTop: 4,
  },
  divider: {
    marginVertical: 14,
    backgroundColor: APP_COLORS.border,
  },
  demoButton: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: APP_COLORS.primaryContainer,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 13,
    color: APP_COLORS.primary,
    fontWeight: '700',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  registerText: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
  },
  loginText: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
  },
  link: {
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 14,
    color: APP_COLORS.accent,
    fontWeight: '700',
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});