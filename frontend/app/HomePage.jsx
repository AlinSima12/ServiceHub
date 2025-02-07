import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ApiService from './service/ApiService';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const HomePage = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedCounty, setSelectedCounty] = useState();
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [user, setUser] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  
    const handleScroll = (event) => {
      const contentHeight = event.nativeEvent.contentSize.height;
      const contentOffsetY = event.nativeEvent.contentOffset.y;
      const layoutHeight = event.nativeEvent.layoutMeasurement.height;
  
      if (contentOffsetY + layoutHeight >= contentHeight - 20) {
        setIsAtBottom(true);
      } else {
        setIsAtBottom(false);
      }
    };

  const counties = [
    "Alba", "Arad", "Arges", "Bacau", "Bihor", "Bistrita-Nasaud", "Botosani", 
    "Brasov", "Braila", "Buzau", "Caras-Severin", "Calarasi", "Cluj", "Constanta", 
    "Covasna", "Dambovita", "Dolj", "Galati", "Giurgiu", "Gorj", "Harghita", 
    "Hunedoara", "Ialomita", "Iasi", "Ilfov", "Maramures", "Mehedinti", "Mures", 
    "Neamt", "Olt", "Prahova", "Satu Mare", "Salaj", "Sibiu", "Suceava", 
    "Teleorman", "Timis", "Tulcea", "Vaslui", "Valcea", "Vrancea", 
    "Bucuresti"
  ];
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };
  
    loadUser();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await ApiService.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories: ", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const offersData = await ApiService.getOffers();
        setOffers(offersData);
      } catch (error) {
        console.error("Error fetching offers: ", error);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    const fetchOffersForCategory = async () => {
      if (selectedCategory) {
        try {
          const county = selectedCounty ? selectedCounty : "";
          const offersData = await ApiService.filterOffers({county:county, category_name:selectedCategory.Name});
          setOffers(offersData);
        } catch (err) {
          console.error("Error fetching offers: ", err);
        }
      } else {
        const offersData = await ApiService.getOffers();
        setOffers(offersData);
      }
    };
    fetchOffersForCategory();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchOffersForCounty = async () => {
      if (selectedCounty || selectedCategory) {
        try {
          const categoryName = selectedCategory ? selectedCategory.Name : "";
          const offersData = await ApiService.filterOffers({county:selectedCounty, category_name:categoryName});
          setOffers(offersData);
        } catch (err) {
          console.error("Error fetching offers: ", err);
        }
      } else {
        const offersData = await ApiService.getOffers();
        setOffers(offersData);
      }
    };
    fetchOffersForCounty();
  }, [selectedCounty]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleCountySelect = (county) => {
    setSelectedCounty(county);
    console.log("Județ selectat:", county);
  };

  const handleOfferSelect = (offer) => {
    ApiService.saveOffer(offer);
    console.log("Oferta selectat:", offer);
    navigation.navigate('OfferDetailScreen', { selectedOffer: offer })
  };

  const truncateText = (text, maxLength = 150) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
      <ScrollView style={styles.container} onScroll={handleScroll} scrollEventThrottle={16}>
        <View style={styles.header}>
          <Text style={styles.logo}>Meseriasii</Text>
          <TouchableOpacity
              style={styles.profilePicture}
              onPress={() => navigation.navigate('profile/PrivateProfileScreen', { user })}
          >
            <Text style={styles.profileText}>P</Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.searchSection}>
          <Text style={styles.slogan}>Profesionisti la un click distanta</Text>
          <TextInput style={styles.searchBar} placeholder="Caută..." />
        </View> */}
        <View style={styles.dropdownContainer}>
        <Text style={styles.sectionJudet}>Alege un judet:</Text>
        <Picker
        // selectedValue={selectedCounty}
        onValueChange={(itemValue) => handleCountySelect(itemValue)}
        style={styles.picker}
        >
        <Picker.Item label="" value={null} style = {styles.picker_item}/>
        {counties.map((county, index) => (
          <Picker.Item key={index} label={county} value={county} style = {styles.picker_item}/>
        ))}
      </Picker>
      </View>
        <ScrollView horizontal style={styles.categorySection} showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
              <TouchableOpacity
                  key={category.id}
                  style={[styles.category, selectedCategory?.id === category.id && styles.selectedCategory]}
                  onPress={() => handleCategorySelect(category)}
              >
                <Text style={styles.categoryText}>{category.Name}</Text>
              </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.offersMeseriasi}>
          <Text style={styles.sectionTitle}>Oferte:</Text>
          {offers.map((offer) => (
              <TouchableOpacity
                  key={offer.id}
                  style={styles.meseriasCard}
                  onPress={() =>handleOfferSelect(offer)}
              >
                <Text style={styles.offerText}>
                  {truncateText(offer.description || 'Nicio descriere disponibilă')}
                </Text>
                <Text style={styles.categoryText}>{offer.category.name}</Text>
                <Text style={styles.startPrice}>de la {offer.start_price} de lei</Text>
              </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionJudet: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a90e2',
    marginTop: 10,
    padding: 8,
  },

  dropdownContainer: {
    marginTop: -6,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',

  },
  picker: {
    height: 50,
    marginTop: 12,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 32,
    width: '40%',
  },
  
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4a90e2',
    borderBottomWidth: 1,
    borderBottomColor: '#d4d4d4',
    elevation: 2,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
    color: '#4a90e2',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  slogan: {
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  searchBar: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    fontSize: 16,
  },
  categorySection: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#eaf0f9',
  },
  category: {
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4a90e2',
    borderRadius: 20,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 16,
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
  },
  offersMeseriasi: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4a90e2',
    marginBottom: 12,
  },
  meseriasCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  offerText: {
    fontSize: 16,
    color: '#666666',
    marginVertical: 8,
  },
  startPrice: {
    fontSize: 16,
    color: '#4a90e2',
  },
  footer: {
    paddingVertical: 20,
    backgroundColor: '#4a90e2',
    borderTopWidth: 1,
    borderTopColor: '#d4d4d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLogo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  contactInfo: {
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  contactLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginRight: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#f0f0f0',
  },
  footerCopy: {
    fontSize: 14,
    color: '#cccccc',
    marginTop: 8,
  },
});

export default HomePage