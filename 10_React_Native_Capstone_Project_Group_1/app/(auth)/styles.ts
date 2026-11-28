/**
 * Shared Styles for Auth Screens
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F1',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 0,
    borderTopWidth: 4,
    borderTopColor: '#1B5E3A',
  },
  cardContent: {
    padding: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2B1B17',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B5750',
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
    backgroundColor: '#FDE4E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#B00020',
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
    color: '#C62828',
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#6B5750',
  },
  link: {
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#C62828',
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B5750',
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
    color: '#2B1B17',
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
    borderColor: '#E3D3CA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: '#C62828',
    backgroundColor: '#FDE4E1',
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B5750',
  },
  genderOptionTextSelected: {
    color: '#C62828',
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
    color: '#6B5750',
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
    color: '#6B5750',
  },
  guideContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FDE4E1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3C4BE',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: '#4A3A34',
    lineHeight: 20,
  },
});