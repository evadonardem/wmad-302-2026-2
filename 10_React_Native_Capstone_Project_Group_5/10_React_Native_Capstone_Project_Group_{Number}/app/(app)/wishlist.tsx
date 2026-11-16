import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, IconButton } from 'react-native-paper';
import { Product } from '@/types/product';
import { productApi } from '@/services/productApi';
import { useFavorites } from '@/context/FavoritesContext';

const orange = '#EE4D2D';

export default function WishlistScreen() {
  const router = useRouter();
  const { favoriteIds, isLoading: favoritesLoading, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    let active = true;
    if (favoritesLoading) return () => { active = false; };
    if (favoriteIds.length === 0) {
      setProducts([]);
      return () => { active = false; };
    }

    setLoadingProducts(true);
    Promise.all(favoriteIds.map((id) => productApi.getProductById(id)))
      .then((savedProducts) => {
        if (active) setProducts(savedProducts);
      })
      .catch((error: unknown) => {
        if (active) {
          Alert.alert('Wishlist unavailable', error instanceof Error ? error.message : 'Please try again.');
        }
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, [favoriteIds, favoritesLoading]);

  const remove = async (id: number) => {
    try {
      await toggleFavorite(id);
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (error) {
      Alert.alert('Could not update wishlist', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  if (favoritesLoading || loadingProducts) {
    return <View style={styles.center}><ActivityIndicator size="large" color={orange} /></View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text style={styles.heading}>My Wishlist</Text>
      </View>
      {products.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No saved items yet</Text>
          <Text style={styles.muted}>Tap the heart on a product to save it here.</Text>
          <Button mode="contained" buttonColor={orange} onPress={() => router.replace('/(app)/(tabs)/home')}>
            Explore products
          </Button>
        </View>
      ) : products.map((product) => (
        <Card key={product.id} style={styles.card} mode="contained">
          <View style={styles.row}>
            <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="contain" />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
              <Text style={styles.price}>
                ${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
              </Text>
              <Button compact textColor={orange} onPress={() => router.push(`/(app)/product/${product.id}`)}>
                View product
              </Button>
            </View>
            <IconButton icon="heart" iconColor={orange} onPress={() => void remove(product.id)} accessibilityLabel="Remove from wishlist" />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 14, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  heading: { color: '#222', fontSize: 22, fontWeight: '800' },
  card: { backgroundColor: '#FFF', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  image: { width: 82, height: 82 },
  info: { flex: 1, paddingHorizontal: 10 },
  title: { color: '#222', fontWeight: '600' },
  price: { color: orange, fontWeight: '800', fontSize: 17, marginTop: 6 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 80 },
  emptyTitle: { fontSize: 20, color: '#222', fontWeight: '700' },
  muted: { color: '#777', textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
