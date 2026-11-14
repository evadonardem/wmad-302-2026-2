import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { styles } from './categoriesStyles';

interface Category {
  name: string;
}

export default function CategoriesScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');

      const names = await recipeApi.getCategories();
      setCategories(names.map(name => ({ name })));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load categories'
      );
    } finally {
      setLoading(false);
    }
  };

  const openCategory = (name: string) => {
    router.push({
      pathname: '/(app)/(tabs)/search',
      params: { category: name },
    });
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => openCategory(item.name)}
      activeOpacity={0.8}
    >
      <Card style={styles.card} elevation={1}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getCategoryIcon(item.name) as any}
              size={32}
              color="#E85D04"
            />
          </View>

          <Title style={styles.categoryName}>{item.name}</Title>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadCategories}>
          <Text style={{ color: '#E85D04', marginTop: 12 }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.pageTitle}>Categories</Title>
      <Text style={styles.pageSubtitle}>Browse recipes by category</Text>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item.name}
        numColumns={2}
        columnWrapperStyle={styles.gridWrapper}
        contentContainerStyle={styles.gridContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Beef: 'cow',
    Chicken: 'chicken',
    Dessert: 'cake',
    Lamb: 'sheep',
    Pasta: 'noodles',
    Pork: 'pig',
    Seafood: 'fish',
    Vegetarian: 'leaf',
  };

  return icons[category] || 'food';
}
