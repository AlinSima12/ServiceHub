import {
  CollectionReference,
  collection,
  query,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { getLogger } from "../utils/utils";

export interface Category {
  id?: string;
  Name: string;
}

export class CategoryRepository {
  private categoriesCollection: CollectionReference = collection(
    db,
    "categories"
  );

  private log = getLogger("CategoryRepository");

  public async getCategories(): Promise<Category[] | undefined> {
    const q = query(this.categoriesCollection);
    const qSnapshot = await getDocs(q).catch((error) => {
      console.error("Error getting documents: ", error);
      throw new Error("Couldn't get categories!");
    });

    if (qSnapshot.docs.length === 0) {
      this.log("No categories found");
      return undefined;
    }

    const categories: Category[] = [];
    for (const doc of qSnapshot.docs) {
      const category = { id: doc.id, ...(doc.data() as Category) };
      // const category = doc.data() as Category;
      category.id = doc.id;
      categories.push(category);
    }
    this.log("categories", categories);

    return categories;
  }
}