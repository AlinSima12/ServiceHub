import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ApiService from './service/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OfferDetailScreen = () => {
  const navigation = useNavigation();  // Use navigation
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    const loadOffer = async () => {
      try {
        const savedOffer = await AsyncStorage.getItem('offer');
        console.log("Loaded Offer:", savedOffer);
        if (savedOffer) {
          setSelectedOffer(JSON.parse(savedOffer));
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

      loadOffer();
      ApiService.loadTokenFromStorage();
  }, []);

  const handleCallPress = () => {
    if (selectedOffer?.meserias?.phoneNumber) {
      Linking.openURL(`tel:${selectedOffer.meserias.phoneNumber}`).catch(() => {
        Alert.alert('Error', 'Unable to open the dialer.');
      });
    } else {
      Alert.alert('Error', 'Phone number is not available.');
    }
  };

  const handleMeseriasProfilePress = () => {
    const user = selectedOffer.meserias;
    ApiService.saveProfile(user);
    navigation.navigate('profile/PublicProfileScreen', { user });
  };

  if (!selectedOffer) {
    return (
        <View style={styles.container}>
          <Text style={styles.errorText}>No offer selected</Text>
        </View>
    );
  }

  return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleMeseriasProfilePress}>
            <Text style={styles.offerTitle}>
              Oferta de la {`${selectedOffer.meserias.first_name || 'N/A'} ${selectedOffer.meserias.last_name_name || ''}`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.offerDetail}>
          <Text style={styles.description}>{selectedOffer.description}</Text>
          <View style={styles.priceCategoryContainer}>
            <Text style={styles.startPrice}>Preț: {selectedOffer.start_price} lei</Text>
            <Text style={styles.categoryText}>{selectedOffer.category.Name}</Text>
          </View>
        </View>

        {/* Butonul de contact, fixat jos */}
        <TouchableOpacity style={styles.callButton} onPress={handleCallPress}>
          <Text style={styles.buttonText}>Contactează</Text>
        </TouchableOpacity>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80,
    backgroundColor: '#f7f9fc',
    flexGrow: 1,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  offerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  offerDetail: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
    lineHeight: 22,
  },
  priceCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  startPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
  },
  categoryText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  callButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    paddingVertical: 12,
    backgroundColor: '#2980b9',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#2980b9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  chatButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    paddingVertical: 12,
    backgroundColor: '#2980b9',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#2980b9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },

  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});

export default OfferDetailScreen;
