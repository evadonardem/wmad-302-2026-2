import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, IconButton } from 'react-native-paper';
import { Product } from '@/types/product';
import { productApi } from '@/services/productApi';
import { useFavorites } from '@/context/FavoritesContext';
import { marketplaceCardShadow, marketplaceColors } from '@/constants/theme';

const brandPurple = '#75648A';

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
    return <View style={styles.center}><ActivityIndicator size="large" color={brandPurple} /></View>;
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
          <Button mode="contained" buttonColor={brandPurple} onPress={() => router.replace('/(app)/(tabs)/home')}>
            Explore products
          </Button>
        </View>
      ) : products.map((product) => (
        <View key={product.id} style={styles.productCardShadow}>
          <Card style={styles.card} mode="contained">
            <View style={styles.row}>
              <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="contain" />
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
                <Text style={styles.price}>
                  ${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                </Text>
                <Button compact textColor={brandPurple} onPress={() => router.push(`/(app)/product/${product.id}`)}>
                  View product
                </Button>
              </View>
              <IconButton icon="heart" iconColor={brandPurple} onPress={() => void remove(product.id)} accessibilityLabel="Remove from wishlist" />
            </View>
          </Card>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.background },
  content: { padding: 16, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  heading: { color: '#30283A', fontSize: 22, fontWeight: '800' },
  productCardShadow: { marginBottom: 12, borderRadius: 16, ...marketplaceCardShadow },
  card: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: marketplaceColors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  image: { width: 82, height: 82, backgroundColor: marketplaceColors.background, borderRadius: 12 },
  info: { flex: 1, paddingHorizontal: 10 },
  title: { color: '#30283A', fontWeight: '700' },
  price: { color: brandPurple, fontWeight: '800', fontSize: 17, marginTop: 6 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 80 },
  emptyTitle: { fontSize: 20, color: '#222', fontWeight: '700' },
  muted: { color: '#746C7A', textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
