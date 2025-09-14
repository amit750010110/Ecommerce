import { httpService } from './http';

export const cartService = {
  async getCart() {
    try {
      const response = await httpService.get('/cart');
      console.log('Cart fetch response:', response);
      return response.data ? response : { data: { items: [], totalItems: 0, totalPrice: 0 } };
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Return empty cart on error instead of throwing
      return { data: { items: [], totalItems: 0, totalPrice: 0 } };
    }
  },

  async addItem(productId, quantity = 1) {
    try {
      console.log(`Adding item ${productId} with quantity ${quantity} to cart`);
      const response = await httpService.post('/cart/items', {
        productId,
        quantity
      });
      console.log('Add to cart response:', response);
      return response.data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },

  async updateItemQuantity(productId, quantity) {
    try {
      const response = await httpService.put(`/cart/items/${productId}?quantity=${quantity}`);
      return response.data;
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  },

  async removeItem(productId) {
    try {
      const response = await httpService.delete(`/cart/items/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  },

  async clearCart() {
    try {
      const response = await httpService.delete('/cart');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};