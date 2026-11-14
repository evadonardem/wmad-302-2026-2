/**
 * FavoriteButton - heart toggle for a recipe.
 * Use on recipe cards, search results and the recipe detail screen.
 */
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useFavorites } from '@/context/FavoritesContext';

interface FavoriteButtonProps {
  recipeId: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function FavoriteButton({ recipeId, size = 22, style }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const active = isFavorite(recipeId);

  return (
    <IconButton
      icon={active ? 'heart' : 'heart-outline'}
      size={size}
      iconColor={active ? '#C62828' : '#8D6E63'}
      containerColor="rgba(255, 255, 255, 0.9)"
      onPress={() => toggleFavorite(recipeId)}
      disabled={!isLoaded}
      style={style}
      accessibilityLabel={active ? 'Remove from favorites' : 'Add to favorites'}
    />
  );
}
