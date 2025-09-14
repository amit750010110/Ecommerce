// Mock orders data since backend order endpoints are not implemented yet
let mockOrders = [];
let orderIdCounter = 1;

// Order service for order-related API calls
export const orderService = {
  // Create new order
  async createOrder(orderData) {
    const newOrder = {
      id: orderIdCounter++,
      ...orderData,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockOrders.push(newOrder);

    return {
      data: newOrder
    };
  },

  // Get user orders
  async getUserOrders() {
    return {
      data: {
        content: mockOrders,
        totalElements: mockOrders.length,
        totalPages: 1,
        size: 10,
        number: 0
      }
    };
  },

  // Get order by ID
  async getOrderById(orderId) {
    const order = mockOrders.find(order => order.id === parseInt(orderId));
    if (!order) {
      throw new Error('Order not found');
    }

    return {
      data: order
    };
  },

  // Cancel order
  async cancelOrder(orderId) {
    const order = mockOrders.find(order => order.id === parseInt(orderId));
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = 'CANCELLED';
    order.updatedAt = new Date().toISOString();

    return {
      data: order
    };
  }
};