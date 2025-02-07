import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated,Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import StarRating from 'react-native-star-rating-widget'; 
import { useNavigation, useRoute } from '@react-navigation/native';
import ApiService from '../service/ApiService';

import AsyncStorage from '@react-native-async-storage/async-storage';

const PublicProfileScreen = () => {
  const route = useRoute();
  const user1 = route.params.user;
    const [user, setUser] = useState(user1);

  const userData = {
    id: user.id,
    username: user.username,  
    first_name: user.first_name,
    last_name: user.last_name,
    phone_number: user.phone_number,
    address: user.address,        
    date: user.date,
    password: user.password,
    type: "user",
    version: 1,
  };

  const [offers, setOffers] = useState([]);
  const [reviewAvg, setAvg] = useState([]);
  const [selectedStars, setSelectedStars] = useState(0); 
  const navigation = useNavigation();

  const [isReviewVisible, setIsReviewVisible] = useState(false); 
  const [slideAnim] = useState(new Animated.Value(-300)); 
  const [widthAnim] = useState(new Animated.Value(0)); 
  const [opacityAnim] = useState(new Animated.Value(1));

  
  const screenWidth = Dimensions.get('window').width;

  
  const toggleReview = () => {
    const middlePosition = (screenWidth - 300) / 2; 

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isReviewVisible ? -300 : middlePosition, 
        duration: 300, 
        useNativeDriver: true, 
      }),
      Animated.timing(widthAnim, {
        toValue: isReviewVisible ? 0 : 300, 
        duration: 300,
        useNativeDriver: false, 
      })
    ]).start();

    
    setIsReviewVisible(!isReviewVisible);
  };

   
   const startBlinking = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7, 
          duration: 1000, 
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1, 
          duration: 1000, 
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  
  useEffect(() => {
    startBlinking();
  }, []);
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user_profile');
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
    const fetchOffers = async () => {
      try {
        const userOffers = await ApiService.getOffersByMeseriasId(userData.id);
        console.log("Offers", userOffers);
        setOffers(userOffers);
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    fetchOffers();
  }, [userData.id]);

  useEffect(() => {
    const fetchReviewAvg = async () => {
      try {
        const reviewAvg = await ApiService.getAverageReviewForUser(userData.id);
        setAvg(reviewAvg);
      } catch (error) {
        console.error('Error fetching average review:', error);
      }
    };

    fetchReviewAvg();
  }, [userData.id]);

  
  const handleReviewSubmit = async () => {
    if (selectedStars === 0) {
      alert('Please select a rating!');
      return;
    }

    try {
      await ApiService.submitReview(userData.id, selectedStars, 'Great service!');
      alert('Thank you for your review!');
      setSelectedStars(0); 
    } catch (error) {
      console.error('Error submitting review:', error);
    }

    
    const reviewAvg = await ApiService.getAverageReviewForUser(userData.id);
    setAvg(reviewAvg);
  };
  

  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.outerContainer}      
        indicatorStyle="black" 
        showsVerticalScrollIndicator={true} 
        showsHorizontalScrollIndicator={false}>
      <View style={styles.innerContainer}>
      <View style={styles.profileContainer}>
        <Image source={require('./images/default.png')} style={styles.profileImage} />
        <Text style={styles.name}>{userData.first_name} {userData.last_name}</Text>
        <View style={styles.starContainer}>
          <StarRating rating={reviewAvg} onChange={() => {}} starSize={30} />
        </View>
        <Text style={styles.username}>@{userData.username}</Text>

        <View style={styles.detailRow}>
          <Icon name="phone" size={20} color="gray" />
          <Text style={styles.phone}> {userData.phone_number}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="home" size={20} color="gray" />
          <Text style={styles.detail}> {userData.address}</Text>
        </View>
        </View>

        <View style={styles.offersHeaderContainer}>
            <Text style={styles.offersHeaderText}>Oferte disponibile</Text>          
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
              </View>
            ))
          ) : (
            <Text style={styles.noOffersText}>Nu sunt oferte disponibile.</Text>
          )}
          </View> 

          </ScrollView>
        <Animated.View
          style={[
            styles.reviewContainer,
            {
              transform: [{ translateX: slideAnim }], 
              width: widthAnim, 
            },
          ]}
        >
          <Text style={styles.reviewTitle}>Dă o notă utilizatorului:</Text>
          <StarRating
            rating={selectedStars}
            onChange={(rating) => setSelectedStars(rating)}
            starSize={40}
            style={styles.starRating}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleReviewSubmit}>
            <Text style={styles.submitButtonText}>Trimite</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.reviewButton, { opacity: opacityAnim }]}>
          <TouchableOpacity onPress={toggleReview}>
            <Icon name="star" size={30} color="#4a90e2" />
          </TouchableOpacity>
        </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', 
  },
  outerContainer: {
    backgroundColor: '#4a90e2',
    padding: 10,
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
  reviewContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0, 
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    borderColor: "black",
    borderTopRightRadius: 10, 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  starRating: {
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reviewButton: {
    position: 'absolute',
    top: '50%', 
    right: 0, 
    backgroundColor: 'white', 
    padding: 15,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    zIndex: 2, 
    transform: [{ translateY: -20 }], 
    borderWidth: 1, 
    borderColor: '#4a90e2', 
  },  
});

export default PublicProfileScreen;
