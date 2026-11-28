import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputKeyPressEvent,
  type TextInputInstance,
  type TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, useTheme } from 'react-native-paper';
import { useSearchHistory } from '@/searchHistory';
import { useThemeMode } from '@/themeMode';

export default function LocationForm({
  onSearch,
  suggestions = [],
}: {
  onSearch: (destination: string) => void;
  suggestions?: string[];
}) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const { entries } = useSearchHistory();
  const [destination, setDestination] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInputInstance>(null);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canSearch = Boolean(destination.trim());
  const matchingSuggestions = useMemo(() => {
    const query = destination.trim().toLocaleLowerCase();
    const choices = [...entries, ...suggestions];
    const uniqueChoices = choices.filter(
      (choice, index) =>
        choices.findIndex((item) => item.toLocaleLowerCase() === choice.toLocaleLowerCase()) ===
        index,
    );

    if (!query) return uniqueChoices.slice(0, 5);
    return uniqueChoices
      .filter((choice) => choice.toLocaleLowerCase().includes(query))
      .slice(0, 5);
  }, [destination, entries, suggestions]);

  const submitSearch = () => {
    const query = destination.trim();
    if (!query) return;

    setIsFocused(false);
    Keyboard.dismiss();
    onSearch(query);
  };

  const handleSearchPress = () => {
    if (canSearch) {
      submitSearch();
      return;
    }

    inputRef.current?.focus();
  };

  const selectSuggestion = (suggestion: string) => {
    setDestination(suggestion);
    setIsFocused(false);
    Keyboard.dismiss();
    onSearch(suggestion);
  };

  const handleKeyPress = (event: TextInputKeyPressEvent) => {
    if (Platform.OS === 'web' && event.nativeEvent.key === 'Enter') {
      event.preventDefault();
      submitSearch();
    }
  };

  useEffect(
    () => () => {
      if (blurTimeout.current) clearTimeout(blurTimeout.current);
    },
    [],
  );

  return (
    <View>
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: isDarkMode ? '#202327' : '#eff3f4',
            borderColor: isFocused ? '#1d9bf0' : 'transparent',
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={canSearch ? 'Submit destination search' : 'Focus destination search'}
          onPress={handleSearchPress}
          style={styles.searchIconButton}
        >
          <Ionicons name="search" size={21} color={theme.colors.onSurfaceVariant} />
        </Pressable>
        <TextInput
          ref={inputRef}
          accessibilityLabel="Search any destination"
          placeholder="Search"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={destination}
          onChangeText={setDestination}
          onFocus={() => {
            if (blurTimeout.current) clearTimeout(blurTimeout.current);
            setIsFocused(true);
          }}
          onBlur={() => {
            blurTimeout.current = setTimeout(() => setIsFocused(false), 160);
          }}
          onSubmitEditing={Platform.OS === 'web' ? undefined : submitSearch}
          onKeyPress={handleKeyPress}
          returnKeyType="search"
          enterKeyHint="search"
          autoCapitalize="words"
          autoCorrect={false}
          style={[
            styles.input,
            Platform.OS === 'web' &&
              ({ outlineStyle: 'none' } as unknown as TextStyle),
            { color: theme.colors.onSurface },
          ]}
        />
        {canSearch ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear destination"
            onPress={() => setDestination('')}
            hitSlop={8}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search destination"
          onPress={handleSearchPress}
          style={({ pressed }) => [
            styles.searchButton,
            { backgroundColor: canSearch ? theme.colors.primary : theme.colors.surfaceVariant },
            pressed && styles.searchButtonPressed,
          ]}
        >
          <Ionicons
            name="arrow-forward"
            size={20}
            color={canSearch ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
          />
        </Pressable>
      </View>

      {isFocused && (matchingSuggestions.length > 0 || canSearch) ? (
        <View
          style={[
            styles.suggestionsPanel,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          {!canSearch && entries.length > 0 ? (
            <Text variant="labelMedium" style={[styles.suggestionsHeading, { color: theme.colors.onSurfaceVariant }]}>
              Recent searches
            </Text>
          ) : null}
          {matchingSuggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              accessibilityRole="button"
              onPress={() => selectSuggestion(suggestion)}
              style={({ hovered, pressed }) => [
                styles.suggestion,
                (hovered || pressed) && { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Ionicons
                name={entries.includes(suggestion) ? 'time-outline' : 'search'}
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyMedium" style={[styles.suggestionText, { color: theme.colors.onSurface }]}>
                {suggestion}
              </Text>
            </Pressable>
          ))}
          {canSearch ? (
            <Pressable
              accessibilityRole="button"
              onPress={submitSearch}
              style={({ hovered, pressed }) => [
                styles.suggestion,
                styles.exactSearch,
                (hovered || pressed) && { backgroundColor: theme.colors.surfaceVariant },
                { borderTopColor: theme.colors.outlineVariant },
              ]}
            >
              <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={[styles.suggestionText, { color: theme.colors.onSurface }]}>
                Search for “{destination.trim()}”
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    minHeight: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchIconButton: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  clearButton: {
    width: 32,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  searchButtonPressed: {
    opacity: 0.8,
  },
  suggestionsPanel: {
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingVertical: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  suggestionsHeading: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: '700',
  },
  suggestion: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    cursor: 'pointer',
  },
  suggestionText: {
    flex: 1,
  },
  exactSearch: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
    paddingTop: 4,
  },
});
