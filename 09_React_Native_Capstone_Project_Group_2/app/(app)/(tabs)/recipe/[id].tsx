import React,{useEffect,useState} from 'react';
import {View,Text,ScrollView,ActivityIndicator,Alert} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {Card,Title,Button,Chip,Divider} from 'react-native-paper';
import {recipeApi} from '@/services/recipeApi';
import {favoritesStorage} from '@/utils/storage';
import type {Recipe} from '@/types/recipe';
export default function RecipeDetailScreen(){
 const {id}=useLocalSearchParams<{id:string}>(); const [recipe,setRecipe]=useState<Recipe|null>(null); const [saved,setSaved]=useState(false); const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;(async()=>{try{const [r,ids]=await Promise.all([recipeApi.getRecipeById(Number(id)),favoritesStorage.getIds()]);if(active){setRecipe(r);setSaved(ids.includes(Number(id)));}}catch(e){Alert.alert('Unable to load recipe',e instanceof Error?e.message:'Please try again');}finally{if(active)setLoading(false);}})();return()=>{active=false}},[id]);
 const toggle=async()=>{if(!recipe)return;const now=await favoritesStorage.toggleId(recipe.id);setSaved(now)};
 if(loading)return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator size="large"/></View>;
 if(!recipe)return <View style={{padding:24}}><Text>Recipe not found.</Text></View>;
 return <ScrollView><Card.Cover source={{uri:recipe.image}}/><View style={{padding:20}}><Title>{recipe.name}</Title><Text>{recipe.cuisine} · {recipe.difficulty} · ⭐ {recipe.rating} ({recipe.reviewCount} reviews)</Text><Text style={{marginVertical:8}}>Prep {recipe.prepTimeMinutes} min · Cook {recipe.cookTimeMinutes} min · {recipe.servings} servings · {recipe.caloriesPerServing} kcal/serving</Text><Button mode={saved?'outlined':'contained'} icon={saved?'heart':'heart-outline'} onPress={toggle}>{saved?'Remove from favorites':'Add to favorites'}</Button><Divider style={{marginVertical:16}}/><Title>Ingredients</Title>{recipe.ingredients.map((x,i)=><Text key={i} style={{paddingVertical:5}}>• {x}</Text>)}<Divider style={{marginVertical:16}}/><Title>Instructions</Title>{recipe.instructions.map((x,i)=><View key={i} style={{paddingVertical:8}}><Text style={{fontWeight:'bold'}}>Step {i+1}</Text><Text>{x}</Text></View>)}<Divider style={{marginVertical:16}}/><Title>Tags</Title><View style={{flexDirection:'row',flexWrap:'wrap'}}>{recipe.tags.map(tag=><Chip key={tag} style={{margin:4}}>{tag}</Chip>)}</View></View></ScrollView>;
}
