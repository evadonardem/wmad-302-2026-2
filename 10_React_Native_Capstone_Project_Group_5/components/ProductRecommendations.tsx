import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFavorites } from '@/context/FavoritesContext';
import { productApi } from '@/services/productApi';
import { Product } from '@/types/product';
import { getPopularSearches } from '@/utils/searchHistory';
import { marketplaceCardShadow, marketplaceColors } from '@/constants/theme';
import { showAlert } from '@/utils/platformAlert';

interface ProductRecommendationsProps {
  title?: string;
  subtitle?: string;
  searchBased?: boolean;
}

export default function ProductRecommendations({
  title = 'You might like',
  subtitle = 'A few picks to explore',
  searchBased = false,
}: ProductRecommendationsProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const loadProducts = async (): Promise<Product[]> => {
      if (!searchBased) {
        const response = await productApi.getProducts({
          limit: 8,
          sortBy: 'rating',
          order: 'desc',
        });
        return response.products;
      }

      const popularSearches = await getPopularSearches(4);
      const searchTerms = popularSearches.length > 0
        ? popularSearches
        : ['phone', 'laptop', 'perfume', 'skincare'];
      const responses = await Promise.all(
        searchTerms.map((term) =>
          productApi.searchProducts(term, { limit: 8, sortBy: 'rating', order: 'desc' })
        )
      );
      const productsById = new Map<number, Product>();
      responses.forEach((response) => {
        response.products.forEach((product) => productsById.set(product.id, product));
      });

      if (productsById.size > 0) return [...productsById.values()].slice(0, 8);

      const fallback = await productApi.getProducts({ limit: 8, sortBy: 'rating', order: 'desc' });
      return fallback.products;
    };

    void loadProducts()
      .then((response) => {
        if (active) setProducts(response);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error ? requestError.message : 'Could not load suggestions.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retry, searchBased]);

  const handleFavorite = async (product: Product) => {
    try {
      const added = await toggleFavorite(product.id);
      showAlert(added ? 'Saved to wishlist' : 'Removed from wishlist', product.title);
    } catch (favoriteError) {
      showAlert(
        'Wishlist unavailable',
        favoriteError instanceof Error ? favoriteError.message : 'Please try again.'
      );
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="star" size={22} color="#75648A" />
      </View>
      {loading ? (
        <ActivityIndicator color="#75648A" style={styles.loading} />
      ) : error ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
          <Button compact onPress={() => setRetry((current) => current + 1)}>
            Try again
          </Button>
        </View>
      ) : (
        <View style={styles.list}>
          {products.map((product) => {
            const salePrice = product.price * (1 - product.discountPercentage / 100);
            return (
              <View key={product.id} style={styles.productCard}>
                <Card style={styles.card} mode="contained">
                  <TouchableOpacity
                    onPress={() => router.push(`/(app)/product/${product.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`View recommended product ${product.title}`}
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: product.thumbnail }}
                        style={{ width: '90%', height: '90%' }}
                        resizeMode="contain"
                      />
                      {product.discountPercentage > 0 && (
                        <Text style={styles.discount}>
                          -{Math.round(product.discountPercentage)}%
                        </Text>
                      )}
                    </View>
                    <Card.Content style={styles.productContent}>
                      <Text style={styles.category} numberOfLines={1}>
                        {product.category.replace(/-/g, ' ')}
                      </Text>
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {product.title}
                      </Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.price}>${salePrice.toFixed(2)}</Text>
                        {product.discountPercentage > 0 && (
                          <Text style={styles.oldPrice}>${product.price.toFixed(2)}</Text>
                        )}
                      </View>
                      <Text style={styles.rating}>
                        ★ {product.rating.toFixed(1)} · {product.stock > 0 ? 'In stock' : 'Sold out'}
                      </Text>
                    </Card.Content>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.favorite}
                    onPress={() => void handleFavorite(product)}
                    accessibilityRole="button"
                    accessibilityLabel={isFavorite(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <MaterialCommunityIcons
                      name={isFavorite(product.id) ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFavorite(product.id) ? '#75648A' : '#3C4043'}
                    />
                  </TouchableOpacity>
                </Card>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: marketplaceColors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: marketplaceColors.border,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: marketplaceColors.text,
  },
  subtitle: {
    fontSize: 13,
    color: marketplaceColors.muted,
    marginTop: 3,
  },
  loading: {
    paddingVertical: 28,
  },
  error: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    color: marketplaceColors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    columnGap: 10,
  },
  productCard: {
    width: '48%',
    flexBasis: '48%',
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 10,
    borderRadius: 14,
    ...marketplaceCardShadow,
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: marketplaceColors.border,
    elevation: 0,
  },
  imageContainer: {
    height: 126,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  discount: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#75648A',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  favorite: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },
  productContent: {
    minHeight: 116,
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  category: {
    color: marketplaceColors.muted,
    fontSize: 11,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  productTitle: {
    minHeight: 36,
    color: marketplaceColors.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  price: {
    color: '#75648A',
    fontSize: 14,
    fontWeight: '700',
  },
  oldPrice: {
    color: '#80868B',
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  rating: {
    marginTop: 5,
    color: marketplaceColors.muted,
    fontSize: 10,
  },
});
