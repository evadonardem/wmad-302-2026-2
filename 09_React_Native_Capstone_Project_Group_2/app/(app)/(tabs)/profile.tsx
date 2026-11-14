/**
 * Profile Screen - Cookbook
 * - Display user info from auth context
 * - Edit profile (PUT /users/{id})
 * - View order history / saved recipes
 * - Settings (notifications, theme, etc.)
 * - Logout
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Title, Button, List, Avatar, Divider, Dialog, Portal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './profileStyles';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated, updateProfile } = useAuth();
  const [editVisible,setEditVisible] = useState(false);
  const [firstName,setFirstName] = useState(user?.firstName ?? '');
  const [lastName,setLastName] = useState(user?.lastName ?? '');
  const [email,setEmail] = useState(user?.email ?? '');
  const [saving,setSaving] = useState(false);
  const [settingsVisible,setSettingsVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleEditProfile = () => {
    setFirstName(user?.firstName ?? ''); setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? ''); setEditVisible(true);
  };
  const saveProfile = async () => {
    if (!user || !firstName.trim() || !lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Check your details','Enter a first name, last name, and valid email.'); return;
    }
    setSaving(true);
    try { await updateProfile({firstName:firstName.trim(),lastName:lastName.trim(),email:email.trim()}); setEditVisible(false); Alert.alert('Profile updated','Your profile changes were saved.'); }
    catch(e) { Alert.alert('Update failed',e instanceof Error?e.message:'Please try again.'); }
    finally { setSaving(false); }
  };

  const handleSettings = () => setSettingsVisible(true);

  const handleMyRecipes = () => router.push('/(app)/(tabs)/search');

  const handleCookbook = () => router.push('/(app)/(tabs)/favorites');

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notLoggedIn}>Please log in to view profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Image
          size={88}
          source={{ uri: user?.image || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Recipes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Collections</Text>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            <List.Item
              title="Discover Recipes"
              description="Explore the recipe collection"
              left={(props) => (
                <MaterialCommunityIcons name="book-edit" size={24} color="#E85D04" style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#8D6E63" style={props.style} />}
              onPress={handleMyRecipes}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="My Cookbook"
              description="Personal collections & meal plans"
              left={(props) => (
                <MaterialCommunityIcons name="book-heart" size={24} color="#E85D04" style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#8D6E63" style={props.style} />}
              onPress={handleCookbook}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Favorites"
              description="Your saved recipes"
              left={(props) => (
                <MaterialCommunityIcons name="heart" size={24} color="#E85D04" style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#8D6E63" style={props.style} />}
              onPress={() => router.push('/(app)/(tabs)/favorites')}
            />
          </List.Section>
        </Card>
      </View>

      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            <List.Item
              title="Edit Profile"
              description="Update your information"
              left={(props) => (
                <MaterialCommunityIcons name="account-edit" size={24} color="#E85D04" style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#8D6E63" style={props.style} />}
              onPress={handleEditProfile}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Settings"
              description="Notifications, theme, privacy"
              left={(props) => (
                <MaterialCommunityIcons name="cog" size={24} color="#E85D04" style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#8D6E63" style={props.style} />}
              onPress={handleSettings}
            />
          </List.Section>
        </Card>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          icon="logout"
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Button>
      </View>



      <Portal>
        <Dialog visible={editVisible} onDismiss={()=>setEditVisible(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput label="First name" value={firstName} onChangeText={setFirstName} mode="outlined" style={{marginBottom:10}} />
            <TextInput label="Last name" value={lastName} onChangeText={setLastName} mode="outlined" style={{marginBottom:10}} />
            <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" mode="outlined" />
          </Dialog.Content>
          <Dialog.Actions><Button onPress={()=>setEditVisible(false)}>Cancel</Button><Button loading={saving} disabled={saving} onPress={saveProfile}>Save</Button></Dialog.Actions>
        </Dialog>
        <Dialog visible={settingsVisible} onDismiss={()=>setSettingsVisible(false)}>
          <Dialog.Title>Settings</Dialog.Title>
          <Dialog.Content><Text>Account settings</Text><Text>Theme and notification preferences are not configured in this starter version.</Text></Dialog.Content>
          <Dialog.Actions><Button onPress={()=>setSettingsVisible(false)}>Close</Button></Dialog.Actions>
        </Dialog>
      </Portal>
      <View style={styles.version}>
        <Text style={styles.versionText}>Cookbook v1.0.0</Text>
      </View>
    </ScrollView>
  );
}