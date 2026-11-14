import React,{useCallback,useEffect,useState} from 'react';
import {View,Text,FlatList,ActivityIndicator,Image} from 'react-native';
import {useFocusEffect,useRouter} from 'expo-router';
import {Card,Title,IconButton,Button} from 'react-native-paper';
import {favoritesStorage} from '@/utils/storage';
import {recipeApi} from '@/services/recipeApi';
import type {Recipe} from '@/types/recipe';
export default function FavoritesScreen(){
 const router=useRouter(); const [items,setItems]=useState<Recipe[]>([]); const [loading,setLoading]=useState(true);
 const load=useCallback(async()=>{setLoading(true);try{const ids=await favoritesStorage.getIds();const rows=await Promise.all(ids.map(id=>recipeApi.getRecipeById(id).catch(()=>null)));setItems(rows.filter((r):r is Recipe=>r!==null));}catch(e){console.warn(e);}finally{setLoading(false);}},[]);
 useFocusEffect(useCallback(()=>{load();},[load]));
 const remove=async(id:number)=>{await favoritesStorage.removeId(id);setItems(old=>old.filter(x=>x.id!==id));};
 if(loading)return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator size="large"/></View>;
 return <FlatList data={items} keyExtractor={r=>String(r.id)} contentContainerStyle={{padding:16,flexGrow:1}} ListHeaderComponent={<Title>Your Favorites ({items.length})</Title>} ListEmptyComponent={<View style={{alignItems:'center',marginTop:60}}><Title>No favorites yet</Title><Text>Save recipes to find them here.</Text><Button mode="contained" onPress={()=>router.push('/(app)/(tabs)/search')}>Browse recipes</Button></View>} renderItem={({item})=><Card style={{marginVertical:8}} onPress={()=>router.push(`/recipe/${item.id}`)}><Card.Cover source={{uri:item.image}}/><Card.Content><Title>{item.name}</Title><Text>{item.cuisine} · ⭐ {item.rating}</Text></Card.Content><Card.Actions><IconButton icon="heart" iconColor="#C62828" onPress={()=>remove(item.id)}/></Card.Actions></Card>}/>
}
