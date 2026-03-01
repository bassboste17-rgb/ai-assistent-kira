/* =============================================
   DAMQ TRAVEL - Firebase Data Service
   ============================================= */

const DamqFirebase = {

  // ===== TOURS =====

  async addTour(tourData, imageFile) {
    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = storage.ref(`tours/${Date.now()}_${imageFile.name}`);
        const snapshot = await storageRef.put(imageFile);
        imageUrl = await snapshot.ref.getDownloadURL();
      }

      const docRef = await db.collection('tours').add({
        ...tourData,
        imageUrl: imageUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        active: true
      });

      return { id: docRef.id, imageUrl };
    } catch (error) {
      console.error('Error adding tour:', error);
      throw error;
    }
  },

  async updateTour(tourId, tourData, imageFile) {
    try {
      const updateData = { ...tourData };

      if (imageFile) {
        const storageRef = storage.ref(`tours/${Date.now()}_${imageFile.name}`);
        const snapshot = await storageRef.put(imageFile);
        updateData.imageUrl = await snapshot.ref.getDownloadURL();
      }

      await db.collection('tours').doc(tourId).update(updateData);
      return updateData;
    } catch (error) {
      console.error('Error updating tour:', error);
      throw error;
    }
  },

  async deleteTour(tourId) {
    try {
      const doc = await db.collection('tours').doc(tourId).get();
      if (doc.exists && doc.data().imageUrl) {
        try {
          const imageRef = storage.refFromURL(doc.data().imageUrl);
          await imageRef.delete();
        } catch (e) {
          // Image might not exist, continue
        }
      }
      await db.collection('tours').doc(tourId).delete();
    } catch (error) {
      console.error('Error deleting tour:', error);
      throw error;
    }
  },

  async getTours(type) {
    try {
      let query = db.collection('tours').where('active', '==', true);
      if (type) {
        query = query.where('type', '==', type);
      }
      query = query.orderBy('createdAt', 'desc');
      const snapshot = await query.get();
      const tours = [];
      snapshot.forEach(doc => {
        tours.push({ id: doc.id, ...doc.data() });
      });
      return tours;
    } catch (error) {
      console.error('Error getting tours:', error);
      return [];
    }
  },

  async getAllTours() {
    try {
      const snapshot = await db.collection('tours').orderBy('createdAt', 'desc').get();
      const tours = [];
      snapshot.forEach(doc => {
        tours.push({ id: doc.id, ...doc.data() });
      });
      return tours;
    } catch (error) {
      console.error('Error getting all tours:', error);
      return [];
    }
  },

  // ===== REVIEWS =====

  async addReview(reviewData) {
    try {
      const docRef = await db.collection('reviews').add({
        ...reviewData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        approved: true
      });
      return { id: docRef.id };
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  async getReviews() {
    try {
      const snapshot = await db.collection('reviews')
        .where('approved', '==', true)
        .orderBy('createdAt', 'desc')
        .get();
      const reviews = [];
      snapshot.forEach(doc => {
        reviews.push({ id: doc.id, ...doc.data() });
      });
      return reviews;
    } catch (error) {
      console.error('Error getting reviews:', error);
      return [];
    }
  },

  async getAllReviews() {
    try {
      const snapshot = await db.collection('reviews').orderBy('createdAt', 'desc').get();
      const reviews = [];
      snapshot.forEach(doc => {
        reviews.push({ id: doc.id, ...doc.data() });
      });
      return reviews;
    } catch (error) {
      console.error('Error getting all reviews:', error);
      return [];
    }
  },

  async deleteReview(reviewId) {
    try {
      await db.collection('reviews').doc(reviewId).delete();
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  async toggleReviewApproval(reviewId, approved) {
    try {
      await db.collection('reviews').doc(reviewId).update({ approved });
    } catch (error) {
      console.error('Error toggling review:', error);
      throw error;
    }
  }
};
