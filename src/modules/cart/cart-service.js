const Cart = require("./models/cart");
const Product = require("../product/models/product");
const logger = require("../../utils/logger");

class CartService {
  static async calculateTotal(cart) {
    const productIds = cart.products_id.map((item) => item.product_id);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const prices = new Map(products.map((product) => [String(product._id), Number(product.price)]));

    cart.total = cart.products_id.reduce(
      (sum, item) => sum + (prices.get(String(item.product_id)) || 0) * item.quantity,
      0
    );
  }

  static async getOrCreateCart(user_id) {
    let cart = await Cart.findOne({ user_id });
    if (!cart) cart = await Cart.create({ user_id, products_id: [], total: 0 });
    return cart;
  }

  static async addProduct(user_id, product_id, quantity = 1) {
    const product = await Product.findById(product_id);
    if (!product) throw new Error("PRODUCT NOT FOUND");

    const cart = await this.getOrCreateCart(user_id);
    const index = cart.products_id.findIndex(
      (item) => String(item.product_id) === String(product_id)
    );

    if (index >= 0) cart.products_id[index].quantity += Number(quantity);
    else cart.products_id.push({ product_id, quantity: Number(quantity) });

    await this.calculateTotal(cart);
    await cart.save();
    logger.info(`Cart updated for user ${user_id}`);
    return cart.populate("products_id.product_id");
  }

  static async getCart(user_id) {
    const cart = await this.getOrCreateCart(user_id);
    await this.calculateTotal(cart);
    await cart.save();
    return cart.populate("products_id.product_id");
  }

  static async removeProduct(user_id, product_id) {
    const cart = await this.getOrCreateCart(user_id);
    cart.products_id = cart.products_id.filter(
      (item) => String(item.product_id) !== String(product_id)
    );
    await this.calculateTotal(cart);
    await cart.save();
    return cart.populate("products_id.product_id");
  }

  static async clearCart(user_id) {
    const cart = await this.getOrCreateCart(user_id);
    cart.products_id = [];
    cart.total = 0;
    await cart.save();
    return cart;
  }
}

module.exports = CartService;