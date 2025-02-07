import {
  CollectionReference,
  DocumentReference,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { getLogger } from "../utils/utils";
import {User} from "./userRepository";

export interface Review {
    id?: string;
    meserias: User;
    stars: number;
    text: string;
    user: User;
}

export class ReviewRepository {
    private reviewCollection: CollectionReference = collection(db, "review");
    private usersCollection: CollectionReference = collection(db, "users");
    private log = getLogger("ReviewRepository");

    /**
     * Fetch all reviews from the 'review' collection.
     * @returns A list of reviews or undefined if no reviews found.
     */


public async getReviews(): Promise<Review[] | undefined> {
    const q = query(this.reviewCollection);
    const qSnapshot = await getDocs(q).catch((error) => {
        console.error("Error getting documents: ", error);
        throw new Error("Couldn't get reviews!");
    });

    if (qSnapshot.docs.length === 0) {
    this.log("No reviews found");
    return undefined;
}

const reviews: Review[] = [];

for (const doc of qSnapshot.docs) {
    const reviewData = doc.data() as Review;

    // Resolve Firestore references for 'user' and 'meserias'
    const userRef = reviewData.user as unknown as DocumentReference;
    const meseriasRef = reviewData.meserias as unknown as DocumentReference;

    const userDoc = await getDoc(userRef);
    const meseriasDoc = await getDoc(meseriasRef);

    // Replace references with actual user and meserias data
    if (userDoc.exists() && meseriasDoc.exists()) {
        reviewData.user = { id: userDoc.id, ...userDoc.data() } as User;
        reviewData.meserias = { id: meseriasDoc.id, ...meseriasDoc.data() } as User;
    }

    reviewData.id = doc.id; // Add the document ID
    reviews.push(reviewData);
}

this.log("Resolved reviews", reviews);
return reviews;
}


/**
     * Fetch reviews by a specific star count.
     * @param starCount The star count to filter by (1-5).
     * @returns A list of reviews matching the star count.
     */
    public async getReviewsByStarCount(starCount: number): Promise<Review[] | undefined> {
        if (starCount < 1 || starCount > 5) {
            throw new Error("Star count must be between 1 and 5.");
        }

        const q = query(this.reviewCollection, where("stars", "==", starCount));
        const qSnapshot = await getDocs(q).catch((error) => {
            console.error("Error getting documents by star count: ", error);
            throw new Error("Couldn't get reviews by star count!");
        });

        if (qSnapshot.docs.length === 0) {
            this.log(`No reviews found with ${starCount} stars`);
            return undefined;
        }

        const reviews: Review[] = [];
        for (const doc of qSnapshot.docs) {
            const review = doc.data() as Review;
            review.id = doc.id;
            reviews.push(review);
        }
        this.log(`reviews with ${starCount} stars`, reviews);

        return reviews;
    }

    /**
     * Add a new review to the database.
     * @param review The review object to add.
     * @returns The ID of the newly added review.
     */
    
public async addReview(meseriasId: string, review: Review): Promise<string> {
    if (!review.meserias || !review.user || !review.stars || !review.text) {
      throw new Error("All fields (meserias, userId, stars, text) are required.");
    }
  
    try {
      // Fetch the user document from the Firestore collection
        const meseriasRef = doc(this.usersCollection, meseriasId);
        const meseriasDoc = await getDoc(meseriasRef).catch((error) => {
            this.log("Error getting documents: ", error);
            throw new Error("Couldn't get meserias!");
          });
  
      // Add the review with the user information to the Firestore
      const reviewWithUser = {
        ...review,  // Your review data
        meserias: meseriasRef,  // Adding the full user data to the review
      };
  
      // Add the review document to the Firestore collection
      const reviewCollectionRef = collection(db, "review");  // Adjust the "reviews" collection name if different
      const newDocRef = await addDoc(reviewCollectionRef, reviewWithUser);
  
      this.log("Added new review with ID:", newDocRef.id);
      
      return newDocRef.id;
    } catch (error) {
      console.error("Error adding review: ", error);
      throw new Error("Couldn't add the review!");
    }
  }

    /**
     * Get the average star rating for a specific meserias.
     * @param meseriasId The ID of the meserias to calculate the average for.
     * @returns The average star rating or undefined if no reviews found.
     */
    public async getAverageReviewForUser(meseriasId: string): Promise<number> {
        // Query reviews where the 'meserias' reference matches the provided meseriasId
        
        const q = query(this.reviewCollection, where("meserias", "==", doc(this.usersCollection, meseriasId)));
        
        // Get reviews
        const qSnapshot = await getDocs(q).catch((error) => {
            console.error("Error getting reviews for meserias: ", error);
            throw new Error("Couldn't get reviews for the specified meserias!");
        });
    
        // If no reviews are found, return 0 as the average
        if (qSnapshot.docs.length === 0) {
            this.log(`No reviews found for meserias with ID: ${meseriasId}`);
            return 0;
        }
    
        let totalStars = 0;
    
        // Iterate through the reviews and sum the stars
        for (const doc of qSnapshot.docs) {
            const review = doc.data() as Review;
            totalStars += review.stars;
        }
    
        // Calculate the average stars
        const averageStars = totalStars / qSnapshot.docs.length;
        this.log(`Average stars for meserias with ID ${meseriasId}:`, averageStars);
    
        return averageStars;
    }
}