import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { marketplaceCardShadow, marketplaceColors } from '@/constants/theme';
import { Product } from '@/types/product';

interface ProductTileProps {
  product: Product;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

const brandPurple = '#75648A';

export default function ProductTile({
  product,
  isFavorite,
  onPress,
  onToggleFavorite,
}: ProductTileProps) {
  const salePrice = product.price * (1 - product.discountPercentage / 100);

  return (
    <View style={styles.tile}>
      <Card style={styles.card} mode="contained">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`View ${product.title}`}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="contain" />
            {product.discountPercentage > 0 && (
              <Text style={styles.discountBadge}>-{Math.round(product.discountPercentage)}%</Text>
            )}
          </View>
          <Card.Content style={styles.content}>
            <Text style={styles.category} numberOfLines={1}>
              {product.category.replace(/-/g, ' ')}
            </Text>
            <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
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
          style={styles.favoriteButton}
          onPress={onToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? brandPurple : '#3C4043'}
          />
        </TouchableOpacity>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    ...marketplaceCardShadow,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: marketplaceColors.border,
  },
  imageContainer: {
    height: 142,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: marketplaceColors.background,
  },
  image: {
    width: '90%',
    height: '90%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
    color: '#FFF',
    backgroundColor: brandPurple,
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    minHeight: 128,
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 10,
  },
  category: {
    color: marketplaceColors.muted,
    fontSize: 11,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  title: {
    minHeight: 38,
    color: marketplaceColors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  price: {
    color: brandPurple,
    fontSize: 15,
    fontWeight: '800',
  },
  oldPrice: {
    color: marketplaceColors.muted,
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  rating: {
    color: marketplaceColors.muted,
    fontSize: 10,
    marginTop: 5,
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFFE8',
  },
});
