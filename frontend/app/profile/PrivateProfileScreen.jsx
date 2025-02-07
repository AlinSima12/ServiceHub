import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Modal, Button, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import StarRating from 'react-native-star-rating-widget'; 
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import ApiService from '../service/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrivateProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const user1 = route.params.user;
  const [user, setUser] = useState(user1);
  console.log("PrivateProfileScreen User:", user);

  const image = require('./images/default.png');
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [reviewAvg, setAvg] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState(100);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);

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
    ApiService.loadTokenFromStorage();
    loadUser();
  }, []);

useEffect(() => {
    const fetchReviewAvg = async () => {
      try {
        const reviewAvg = await ApiService.getAverageReviewForUser(user.id);
        setAvg(reviewAvg);
      } catch (error) {
        console.error('Error fetching average review:', error);
      }
    };

    fetchReviewAvg();
  }, []);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const userOffers = await ApiService.getOffersByMeseriasId(user.id);
        console.log("Offers", userOffers);
        setOffers(userOffers);
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const categoriesList = await ApiService.getCategories();
        setCategories(categoriesList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    console.log("User", user);
    if(user.id) {
      fetchOffers();
      fetchCategories();
    }
  }, [user]);

  const handleSaveDetails = async () => {
  
    const offerRequest = {
      meserias_id: user.id,
      category_id: selectedCategory,
      description,
      start_price: startPrice,
    };
  
    try {
      await ApiService.addOffer(offerRequest);
  

      const userOffers = await ApiService.getOffersByMeseriasId(user.id);
      setOffers(userOffers);
  
      alert('Oferta a fost salvată!');
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('A apărut o eroare la salvarea ofertei!');
    }
  };

  const handleOfferPress = (offer) => {
    setSelectedCategory(offer.category.id);
    console.log(offer);
    console.log(selectedCategory);
    setSelectedOffer(offer);
    setOfferModalVisible(true);
  };

  const handleUpdateOffer = async () => {
    
    const offerRequest = {
      id: selectedOffer.id,
      meserias_id: user.id,
      category_id: selectedCategory,
      description:  selectedOffer.description,
      start_price: selectedOffer.start_price,
    };
  
    try {
      await ApiService.updateOffer(offerRequest);
      const userOffers = await ApiService.getOffersByMeseriasId(user.id);
      setOffers(userOffers);
  
      alert('Oferta a fost modificata!');
      setOfferModalVisible(false);
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('A apărut o eroare la salvarea ofertei!');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.outerContainer}
    indicatorStyle="black"
    showsVerticalScrollIndicator={true}
    showsHorizontalScrollIndicator={false}>
      <View style={styles.innerContainer}>
      <View style={styles.profileContainer}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('profile/SettingsScreen', { user })}
        >
          <Icon name="cogs" size={30} color="gray" />
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="plus" size={30} color="gray" />
        </TouchableOpacity> */}

        <Image source={image} style={styles.profileImage} />
        <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
        <View style={styles.starContainer}>
          <StarRating rating={reviewAvg} onChange={() => {}} starSize={30} />
        </View>
        <Text style={styles.username}>@{user.username}</Text>



        <View style={styles.detailRow}>
          <Icon name="phone" size={20} color="gray" />
          <Text style={styles.phone}>{user.phone_number}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="home" size={20} color="gray" />
          <Text style={styles.detail}>{user.address}</Text>
        </View>
        </View>

        <View style={styles.offersHeaderContainer}>
          <Text style={styles.offersHeaderText}>Ofertele mele</Text>
          
          <TouchableOpacity
            style={styles.addOfferButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="plus" size={30} color="gray" />
          </TouchableOpacity>
        </View>

        <View style={styles.horizontalLine}></View>
        {offers.length > 0 ? (
          offers.map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerDescription}>
                {offer.description}
              </Text>
              <Text style={styles.offerPrice}>Pret de la: {offer.start_price} RON</Text>
              <Text style={styles.offerCategory}>{offer.category.Name}</Text>
              <TouchableOpacity
                style={styles.editIconContainer}
                onPress={() => handleOfferPress(offer)}
              >
                <Icon name="edit" size={24} color="gray" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noOffersText}>Nu sunt oferte disponibile.</Text>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adaugă detalii</Text>

            <TextInput
              style={styles.descriptionInput}
              placeholder="Descriere"
              value={description}
              onChangeText={setDescription}
              multiline={true}
            />

            <Text style={styles.label}>Selectează Categorie</Text>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selectează o categorie" value={"Selecteaza o categorie"} />
              {categories.map((category) => (
                <Picker.Item key={category.id} label={category.Name} value={category.id} />
              ))}
            </Picker>

            <Text style={styles.label}>Preț de la: {startPrice} RON</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10000}
              step={10}
              value={startPrice}
              onValueChange={(value) => setStartPrice(value)}
            />

            <View style={styles.modalButtons}>
              <Button title="Anulează" onPress={() => setModalVisible(false)} />
              <Button title="Salvează" onPress={handleSaveDetails} />
            </View>
          </View>
        </View>
      </Modal>


      <Modal
        visible={offerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOfferModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editează Oferta</Text>

            <TextInput
              style={styles.descriptionInput}
              placeholder="Descriere"
              value={selectedOffer?.description || ''}
              onChangeText={(text) => setSelectedOffer({ ...selectedOffer, description: text })}
              multiline={true}
            />
            <Text style={styles.label}>Selectează Categorie</Text>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selectează o categorie" value={null} />
              {categories.map((category) => (
                <Picker.Item key={category.id} label={category.Name} value={category.id} />
              ))}
            </Picker>
            <Text style={styles.label}>Preț de la: {selectedOffer?.start_price} RON</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10000}
              step={10}
              value={selectedOffer?.start_price || 100}
              onValueChange={(value) => setSelectedOffer({ ...selectedOffer, start_price: value })}
            />

            <View style={styles.modalButtons}>
              <Button title="Anulează" onPress={() => setOfferModalVisible(false)} />
              <Button title="Salvează" onPress={handleUpdateOffer} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    // backgroundColor: '#4a90e2',
    backgroundColor: 'white',
    padding: 10,
    // flex: 1
  },
  innerContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 10,
    paddingVertical: 20,
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 20,
  },  
  profileContainer: {
    flex: 1,
    borderRadius: 15,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    width: '100%',
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  phone: {
    fontSize: 16,
    marginBottom: 15,
  },
  offersHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',           
    marginVertical: 10,             
    paddingLeft: 100,
    paddingRight: 100,
    width: '100%',                  
  },
  
  offersHeaderText: {
    fontSize: 20,                   
    fontWeight: 'bold',             
    color: 'black',                
    textAlign: 'center',           
    flex: 1,                       
  },
  
  addOfferButton: {
    marginLeft: 10,                
  },

  horizontalLine: {
    width: '90%',                
    height: 1,                   
    backgroundColor: 'gray',     
    marginTop: 10,               
    marginBottom: 20,            
  },
  detail: {
    fontSize: 14,
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  descriptionInput: {
    height: 200,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
  offerCard: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, 
    marginBottom: 10,
    width: '90%',
    position: 'relative',
  },  
  editIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10, 
    zIndex: 1, 
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins',
  },
  offerDescription: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    fontFamily: 'Roboto',
  },
  offerPrice: {
    marginTop: 10,
    fontSize: 18,  
    fontWeight: 'bold',
    color: '#878CD8',
    fontFamily: 'Poppins', 
  },
  offerCategory: {
    marginTop: 5,
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    fontFamily: 'Roboto', 
  },
  noOffersText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default PrivateProfileScreen;