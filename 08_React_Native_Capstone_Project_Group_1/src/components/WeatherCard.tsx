import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useLanguage, type StringKey } from '@/i18n';
import { getWeatherForPlace, type Weather } from '@/services/weatherService';

// Turns a WMO weather code into an emoji and a translated word.
const describe = (code: number): { emoji: string; key: StringKey } => {
  if (code === 0) return { emoji: '☀️', key: 'w_clear' };
  if (code <= 3) return { emoji: '⛅', key: 'w_cloudy' };
  if (code === 45 || code === 48) return { emoji: '🌫️', key: 'w_fog' };
  if (code >= 51 && code <= 57) return { emoji: '🌦️', key: 'w_drizzle' };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { emoji: '🌧️', key: 'w_rain' };
  if (code >= 95) return { emoji: '⛈️', key: 'w_storm' };
  return { emoji: '☁️', key: 'w_cloudy' };
};

// Weather for the place that was chosen or searched. It stays hidden when the place or the
// forecast cannot be found.
export default function WeatherCard({ placeName }: { placeName: string }) {
  const theme = useTheme();
  const { t, lang } = useLanguage();
  const [result, setResult] = useState<{ name: string; weather: Weather | null } | null>(null);

  useEffect(() => {
    let active = true;
    if (!placeName) return;
    getWeatherForPlace(placeName).then((weather) => {
      if (active) setResult({ name: placeName, weather });
    });
    return () => {
      active = false;
    };
  }, [placeName]);

  // Only show the weather that belongs to the current place
  const weather = result?.name === placeName ? result.weather : null;
  if (!weather) return null;

  const now = describe(weather.code);
  const shortName = placeName.replace(/^(City of|Municipality of)\s+/i, '');
  const locale = lang === 'fil' ? 'fil-PH' : 'en-PH';

  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {t('weatherTitle', { name: shortName })}
        </Text>

        <View style={styles.nowRow}>
          <Text style={styles.emoji}>{now.emoji}</Text>
          <View>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
              {Math.round(weather.temperature)}°C
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t(now.key)}
            </Text>
          </View>
          <View style={styles.details}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              💧 {t('humidity')}: {Math.round(weather.humidity)}%
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              💨 {t('wind')}: {Math.round(weather.wind)} km/h
            </Text>
          </View>
        </View>

        {/* The next three days */}
        <View style={styles.forecastRow}>
          {weather.daily.slice(1, 4).map((day) => (
            <View key={day.date} style={[styles.day, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {new Date(`${day.date}T12:00:00`).toLocaleDateString(locale, { weekday: 'short' })}
              </Text>
              <Text style={styles.dayEmoji}>{describe(day.code).emoji}</Text>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
                {Math.round(day.max)}° / {Math.round(day.min)}°
              </Text>
            </View>
          ))}
        </View>

        <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
          {t('weatherSource')}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  content: {
    gap: 10,
  },
  nowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  emoji: {
    fontSize: 44,
  },
  details: {
    gap: 2,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: 8,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 2,
  },
  dayEmoji: {
    fontSize: 22,
  },
});