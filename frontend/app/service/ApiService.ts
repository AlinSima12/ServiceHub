import axios, { AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://localhost:3000";

interface User {
  id?: string;
  username: string;
  type: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  date: string;
  version: number;
  county: string;
}

interface Offer {
  id?: string;
  meserias: User;
  category: Category;
  description: string;
  start_price: number;
}

export interface OfferRequest {
  id?: string;
  meserias_id: string;
  category_id: string;
  description: string;
  start_price: number;
}

interface Category {
  id?: string;
  Name: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
}

interface OfferFilters {
  county?: string;
  category_name?: string;
}


class ApiService {
  private token: string | null = null;
  private allOffers: Offer[] = [];
  private selectedOffer: Offer | null = null;
  setToken(token: string): void {
    this.token = token;
    this.saveTokenToStorage(token);
  }

  async loadTokenFromStorage(): Promise<void> {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      if (storedToken) {
        this.token = storedToken;
        console.log("Token loaded from storage", this.token);
      }
    } catch (error) {
      console.error("Failed to load token from storage:", error);
    }
    
  }

  async clearTokenFromStorage(): Promise<void> {
    try {
      await AsyncStorage.removeItem("authToken");
      this.token = null;
    } catch (error) {
      console.error("Failed to clear token from storage:", error);
    }
  }

  async saveTokenToStorage(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Failed to save token to storage:", error);
    }
    console.log("Token saved to storage", token);
  }

  async saveUser(user: User)  {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      console.log('User data saved:', user);
    } catch (err) {
      console.error('Error saving user data:', err);
    }
  };

  async saveProfile(user: User)  {
    try {
      await AsyncStorage.setItem('user_profile', JSON.stringify(user));
      console.log('User data saved:', user);
    } catch (err) {
      console.error('Error saving user data:', err);
    }
  };

  async saveOffer(offer: Offer)  {
    try {
      await AsyncStorage.setItem('offer', JSON.stringify(offer));
      console.log('Offer data saved:', offer);
    } catch (err) {
      console.error('Error saving user data:', err);
    }
  };

  async login(username: string, password: string): Promise<User> {
    // const response: AxiosResponse<{ token: string; user: User }> = await axios.post(
    //   `${BASE_URL}/auth/login`,
    //   { username, password }
    // );
    const response: AxiosResponse<{ token: string; user: User }> =
      await axios.post(`${BASE_URL}/auth/login`, { username, password });

    this.setToken(response.data.token);

    return response.data.user;
  }

  async register(user: User, password: string): Promise<string> {
    const response: AxiosResponse<RegisterResponse> = await axios.post(
      `${BASE_URL}/auth/register`,
      { user, password }
    );
    this.token = response.data.token;
    await this.saveTokenToStorage(response.data.token);
    return response.data.token;
  }

  async logout(): Promise<void> {
    if (!this.token) {
      throw new Error("User is not logged in.");
    }

    await axios.get(`${BASE_URL}/auth/logout`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    this.token = null;
    await this.clearTokenFromStorage();
  }

  async updateUser(user: User): Promise<User> {
    if (!this.token) {
      throw new Error("User is not logged in.");
    }
    this.saveUser(user);

    const response: AxiosResponse<{ user: User }> = await axios.put(
      `${BASE_URL}/users`,
      user,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );

    return response.data.user;
  }
   async updateUserPassword(
    userId: string,
    oldPassword: string,
    newPassword: string
    ): Promise<string> {
    if (!this.token) {
      throw new Error("User is not logged in.");
    }

    try {
      const response: AxiosResponse<{ message: string }> = await axios.post(
        `${BASE_URL}/auth/change-password`,
        { userId, oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );

      return response.data.message;
    } catch (error) {
      console.error("Error changing password:", error);
      throw new Error("Could not change password! Please try again later.");
    }
  }


  async getUserById(id: string): Promise<User> {
    const response: AxiosResponse<{ user: User }> = await axios.get(
      `${BASE_URL}/users/${id}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );
    return response.data.user;
  }

  async getOffersByMeseriasId(meseriasId: string): Promise<Offer[]> {
    const response: AxiosResponse<{ offers: Offer[] }> = await axios.get(
      `${BASE_URL}/offers/meserias/${meseriasId}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );
    return response.data.offers;
  } 


  async getOffers(): Promise<Offer[]> {
      const response: AxiosResponse<{ offers: Offer[] }> = await axios.get(
        `${BASE_URL}/offers`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      this.allOffers = response.data.offers;
      return response.data.offers;

  }

  async updateOffer(offer: OfferRequest): Promise<void> {
    console.log("Update offer:", offer);
    try {
      const response: AxiosResponse<{ offer: OfferRequest }> = await axios.put(
        `${BASE_URL}/offers`,
        offer,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
    } catch (error) {
      console.error("Error updating offer:", error);
      throw new Error("Couldn't update offer!");
    }
  }

  async deleteOffer(offer_id: string): Promise<void> {
    try {
      await axios.delete(
        `${BASE_URL}/offers`,
        {
          data : { offer_id: offer_id },
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
    } catch (error) {
      console.error("Error deleting offer:", error);
      throw new Error("Couldn't delete offer!");
    }
  }

  async filterOffers(filters: OfferFilters): Promise<Offer[]> {
    console.log(filters);
    console.log("Token:", this.token);
    const queryString = `?${filters.county ? `county=${filters.county}` : ""}${
      filters.county ? "&" : ""
    }${filters.category_name ? `category_name=${filters.category_name}` : ""}`;
    try {
      const response = await axios.get(
        `${BASE_URL}/offers/filter${queryString}`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );

      return response.data.offers;
    } catch (error) {
      console.error("Error filtering offers:", error);
      throw new Error("Couldn't filter offers!");
    }
  }
  
  async getCategories(): Promise<Category[]> {
    console.log("getCategories");
    const response: AxiosResponse<{ categories: Category[] }> = await axios.get(
      `${BASE_URL}/categories`
    );
    console.log(response.data.categories);
    return response.data.categories;
  }

  async addOffer(offer: OfferRequest): Promise<OfferRequest> {
    try {
      const response: AxiosResponse<{ offer: OfferRequest }> = await axios.post(
        `${BASE_URL}/offers`,
        offer,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      return response.data.offer; // Returnează oferta adăugată
    } catch (error) {
      console.error("Error adding offer:", error);
      throw new Error("Couldn't add offer!");
    }
  }

  async getAverageReviewForUser(userId: string): Promise<number> {
    try {
      const response: AxiosResponse<{ averageReview: number }> = await axios.get(
        `${BASE_URL}/reviews/average/${userId}`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      console.log(response)
      return response.data.averageReview;
    } catch (error) {
      console.error("Error fetching average review for user:", error);
      throw new Error("Couldn't fetch the average review for the user!");
    }
  }

  async submitReview(meseriasId: string, stars: number, text: string): Promise<any> {
  if (!this.token) {
    throw new Error("User is not logged in.");
  }

  try {
    const response: AxiosResponse<{ message: string, id: string }> = await axios.post(
      `${BASE_URL}/reviews`,
      {
        meserias: meseriasId,  
        stars,                 
        text,                  
        user: this.token,      
      },
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw new Error("Could not submit review! Please try again later.");
  }
  }

}


export default new ApiService();
