/**
 * Custom Collections Screen - Botanical Sage & Terracotta Theme
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collectionsStorage, Collection } from '@/utils/storage';
import { APP_COLORS } from '@/constants/theme';

export default function CollectionsScreen() {
  const [collections, setCollections] = useState<Collection[]>([]);

  const loadCollections = useCallback(async () => {
    const data = await collectionsStorage.getCollections();
    setCollections(data || []);
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Recipe Folios</Title>
        <Text style={styles.subtitle}>Curated collections of your favorite dishes</Text>
      </View>
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card} elevation={1}>
            <Card.Content style={styles.cardRow}>
              <View style={styles.folderBadge}>
                <MaterialCommunityIcons name="book-open-variant" size={24} color={APP_COLORS.primary} />
              </View>
              <View style={styles.textGroup}>
                <Title style={styles.colTitle}>{item.name}</Title>
                <Text style={styles.colCount}>{(item.recipeIds || []).length} saved recipes</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={APP_COLORS.textSecondary} />
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: APP_COLORS.textPrimary },
  subtitle: { fontSize: 14, color: APP_COLORS.textSecondary },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    marginBottom: 12,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  folderBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: APP_COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textGroup: { flex: 1 },
  colTitle: { fontSize: 17, fontWeight: '700', color: APP_COLORS.textPrimary },
  colCount: { fontSize: 13, color: APP_COLORS.accent, fontWeight: '600', marginTop: 2 },
});