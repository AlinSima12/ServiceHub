import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

import { compare, genSalt, getSalt, hash } from "bcrypt-ts";
let bcrypt_ts: typeof import("bcrypt-ts");

import { getLogger } from "../utils/utils";

export interface User {
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

interface UserPrivate extends User {
  password: string;
}

const saltRounds = 10;

export class UserRepository {
  private usersCollection: CollectionReference = collection(db, "users");
  private log = getLogger("UserRepository");

  /**
   * Checks if the user exists in the Firestore database
   *
   * @param username The username of the user
   * @param password The password of the user
   * @returns The user if the login was successful, undefined otherwise
   */

  public async login(
    username: string,
    password: string
  ): Promise<User | undefined> {
    const q = query(this.usersCollection, where("username", "==", username));
    const qSnapshot: QuerySnapshot = await getDocs(q).catch((error) => {
      console.error("Error getting documents: ", error);
      throw new Error("Couldn't login!");
    });

    if (qSnapshot.docs.length === 0) {
      this.log(`User with username ${username} not found`);
      return undefined;
    }

    const userDoc = qSnapshot.docs[0];
    const user = userDoc.data() as UserPrivate;
    user.id = userDoc.id;

    if (!bcrypt_ts) {
      bcrypt_ts = await import("bcrypt-ts");
    }
    // retrieve the salt from the password
    // and rehash the password with that salt
    const passwordSalt = bcrypt_ts.getSalt(user.password);
    const passwordHash = await bcrypt_ts.hash(password, passwordSalt);

    // compare the password hashes
    const isPasswordValid = await bcrypt_ts.compare(password, passwordHash);
    return isPasswordValid ? user : undefined;
  }

  /**
   * Registers the user into the Firestore database
   * The user is assigned the id field from the Firestore database
   *
   * @param user The user to be registered
   * @param password The password of the user
   * @throws Error if the user couldn't be registered
   */
  public async register(user: User, password: string): Promise<void> {
    if (!bcrypt_ts) {
      bcrypt_ts = await import("bcrypt-ts");
    }

    const salt = await bcrypt_ts.genSalt(saltRounds);
    const hashedPassword = await bcrypt_ts.hash(password, salt);

    user.date = new Date().toUTCString();
    user.version = 1;
    const userPrivate: UserPrivate = { ...user, password: hashedPassword };

    const result = await addDoc(this.usersCollection, userPrivate).catch(
      (error) => {
        this.log("Error adding document: ", error);
        throw new Error("Couldn't register!");
      }
    );

    this.log("Document written with ID: ", result.id);
    user.id = result.id;
    return Promise.resolve();
  }

  /**
   * Returns a user object from the Firestore database
   * @param userId The id of the user
   * @returns The user object
   * @throws Error if the user is not found
   */
  public async getUserById(userId: string): Promise<User> {
    const userRef = doc(this.usersCollection, userId);
    const userDoc = await getDoc(userRef).catch((error) => {
      this.log("Error getting documents: ", error);
      throw new Error("Couldn't get user!");
    });

    if (!userDoc.exists()) {
      this.log(`User with id ${userId} not found`);
      throw new Error("User not found!");
    }

    const { password, ...user } = userDoc.data() as UserPrivate;

    return {
      id: userDoc.id,
      ...user,
    } as User;
  }

  /**
   * Updates the specified user
   * @param user the user to be updated
   * @throws Error if the user couldn't be updated
   */
  public async updateUser(user: User): Promise<User> {
    const userRef = doc(this.usersCollection, user.id);

    user.date = new Date().toUTCString();
    user.version += 1;

    const { id, ...updateData } = user;

    await updateDoc(userRef, updateData).catch((error) => {
      this.log("Error updating document: ", error);
      throw new Error("Couldn't update user!");
    });

    return user;
  }

  /**
   * Changes the password of the user
   * @param userId The id of the user
   * @param oldPassword The old password
   * @param newPassword The new password
   * @throws Error if the password couldn't be changed
   */
  public async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const userRef = doc(this.usersCollection, userId);
    const userDoc = await getDoc(userRef).catch((error) => {
      this.log("Error getting documents: ", error);
      throw new Error("Couldn't get user!");
    });

    if (!userDoc.exists()) {
      this.log(`User with id ${userId} not found`);
      throw new Error("User not found!");
    }

    const { password, ...user } = userDoc.data() as UserPrivate;

    // check if the old password is correct
    const isPasswordValid = await bcrypt_ts.compare(oldPassword, password);
    if (!isPasswordValid) {
      throw new Error("Invalid password!");
    }

    if (!bcrypt_ts) {
      bcrypt_ts = await import("bcrypt-ts");
    }

    // update the password
    const salt = await bcrypt_ts.genSalt(saltRounds);
    const hashedPassword = await bcrypt_ts.hash(newPassword, salt);
    await updateDoc(userRef, { password: hashedPassword }).catch((error) => {
      this.log("Error updating document: ", error);
      throw new Error("Couldn't change password!");
    });

    return Promise.resolve();
  }
}

