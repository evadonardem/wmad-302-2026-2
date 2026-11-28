/**
 * Product Details Screen - Marketplace
 * Displays product information and supports adding products to the persistent cart.
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, IconButton } from 'react-native-paper';
import { productApi } from '@/services/productApi';
import { cartStorage, favoritesStorage } from '@/utils/storage';
import type { Product } from '@/types/product';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    productApi.getProductById(Number(id))
      .then((item) => { if (active) setProduct(item); })
      .catch((error) => Alert.alert('Unable to load product', error instanceof Error ? error.message : 'Please try again.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const addToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await cartStorage.addItem({
        productId: product.id, title: product.title, thumbnail: product.thumbnail,
        price: product.price, discountPercentage: product.discountPercentage,
        quantity: 1, stock: product.stock,
      });
      Alert.alert('Added to cart', `${product.title} was added to your cart.`, [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(app)/(tabs)/cart') },
      ]);
    } catch (error) { Alert.alert('Could not add item', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setAdding(false); }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    const saved = await favoritesStorage.toggleId(product.id);
    Alert.alert(saved ? 'Saved to wishlist' : 'Removed from wishlist', product.title);
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0F2FE' }}><ActivityIndicator size="large" color="#38BDF8" /></View>;
  if (!product) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#E0F2FE' }}><Text style={{ color: '#202124', marginBottom: 16 }}>Product not found.</Text><Button mode="contained" onPress={() => router.back()}>Go Back</Button></View>;

  const price = product.price * (1 - product.discountPercentage / 100);
  return <ScrollView style={{ flex: 1, backgroundColor: '#E0F2FE' }} contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <IconButton icon="arrow-left" iconColor="#0284C7" onPress={() => router.back()} />
      <IconButton icon="heart-outline" iconColor="#0284C7" onPress={toggleWishlist} />
    </View>
    <Card style={{ backgroundColor: '#F0F9FF', borderRadius: 16 }}>
      <Image source={{ uri: product.thumbnail }} resizeMode="contain" style={{ width: '100%', height: 280, backgroundColor: '#E0F2FE' }} />
      <Card.Content style={{ padding: 18 }}>
        <Text style={{ color: '#0284C7', fontWeight: '700', textTransform: 'uppercase' }}>{product.category}</Text>
        <Text style={{ color: '#202124', fontSize: 24, fontWeight: '700', marginTop: 8 }}>{product.title}</Text>
        <Text style={{ color: '#5F6368', lineHeight: 22, marginTop: 10 }}>{product.description}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
          <Text style={{ color: '#0284C7', fontSize: 24, fontWeight: '700' }}>${price.toFixed(2)}</Text>
          {product.discountPercentage > 0 && <Text style={{ color: '#5F6368', textDecorationLine: 'line-through', marginLeft: 10 }}>${product.price.toFixed(2)}</Text>}
        </View>
        <Text style={{ color: '#5F6368', marginTop: 8 }}>★ {product.rating.toFixed(1)} · {product.stock} in stock</Text>
        {product.brand ? <Text style={{ color: '#5F6368', marginTop: 4 }}>Brand: {product.brand}</Text> : null}
        <Button mode="contained" icon="cart-plus" onPress={addToCart} loading={adding} disabled={adding || product.stock < 1} style={{ marginTop: 22 }}>Add to Cart</Button>
      </Card.Content>
    </Card>
  </ScrollView>;
}
