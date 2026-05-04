import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ChevronLeft,
  Loader2,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { createOrder } from '../services/api';
import { Member } from '../types';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, itemsCount, totalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    const savedUser = localStorage.getItem('uj_member');
    if (!savedUser) {
      navigate('/login');
      return;
    }

    const user: Member = JSON.parse(savedUser);
    const memberId = user.id || (user as any).member_id;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await createOrder({
        member_id: memberId,
        store_id: "10371d88-a490-4ad3-b895-de195a5025d5", // Default store
        items: cart.map(item => ({
          menu_item_id: item.id || (item as any).item_id || "",
          quantity: item.quantity,
          price: item.price,
          size: item.size || "Regular"
        }))
      });

      setIsSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error("Order completion error:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-white p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center text-center max-w-lg border border-green-100 relative overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-50 rounded-full blur-3xl opacity-50"></div>
          
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-10 border-8 border-white shadow-lg relative z-10">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          
          <h2 className="text-4xl font-display font-bold text-brand-dark mb-4 relative z-10">You're All Set!</h2>
          <p className="text-gray-500 text-lg mb-10 leading-relaxed relative z-10">
            Your order has been sent to Uncle Joe's kitchen. We've added this to your history, and your points have been updated!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10">
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-brand-dark text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-brand-dark/10"
            >
              View Order History <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/menu')}
              className="flex-1 bg-brand-muted text-brand-dark font-bold py-5 rounded-2xl hover:bg-gray-100 transition-all"
            >
              Order More
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-10">
        <Link to="/menu" className="p-3 bg-white border border-black/5 rounded-2xl hover:bg-gray-50 transition-colors">
          <ChevronLeft size={24} className="text-brand-dark" />
        </Link>
        <div>
          <h1 className="text-4xl font-display font-bold text-brand-dark">Review Cart</h1>
          <p className="text-gray-500">{itemsCount} items in your bag</p>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-16 text-center shadow-xl border border-black/5">
          <div className="w-24 h-24 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-display font-bold text-brand-dark mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 mx-auto max-w-sm">
            Looks like you haven't added any of Joe's premium coffee or treats yet.
          </p>
          <Link 
            to="/menu" 
            className="inline-flex items-center gap-2 bg-brand-primary text-brand-dark font-bold px-10 py-5 rounded-2xl hover:scale-105 transition-transform"
          >
            Start Ordering <ArrowRight size={20} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode='popLayout'>
              {cart.map((item) => {
                const itemId = item.id || (item as any).item_id;
                return (
                  <motion.div 
                    key={itemId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: -50 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-sm group flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-black/5 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-brand-muted rounded-3xl flex items-center justify-center overflow-hidden shrink-0">
                         {item.category === 'Coffee' || item.category === 'Espresso' ? (
                           <PackageCheck className="text-brand-primary w-8 h-8" />
                         ) : (
                           <PackageCheck className="text-brand-primary w-8 h-8" />
                         )}
                      </div>
                      <div>
                        <h3 className="text-xl font-display font-bold text-brand-dark leading-tight mb-1">{item.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{item.size}</span>
                          <span>•</span>
                          <span>{item.calories} Cal</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-10">
                      <div className="flex items-center bg-brand-muted p-1.5 rounded-2xl border border-black/5">
                        <button 
                          onClick={() => updateQuantity(itemId, -1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-colors text-brand-dark"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold font-display text-brand-dark text-lg">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(itemId, 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-colors text-brand-dark"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right min-w-[100px]">
                        <p className="text-2xl font-display font-bold text-brand-dark mb-1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button 
                          onClick={() => removeFromCart(itemId)}
                          className="text-red-500 font-bold text-xs flex items-center gap-1 ml-auto hover:underline"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="bg-brand-dark rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden sticky top-24">
              <h3 className="text-2xl font-display font-bold mb-8">Order Summary</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Est. Points Earned</span>
                  <span className="text-brand-primary font-bold">+{Math.floor(totalPrice * 10)}</span>
                </div>
                <div className="border-t border-white/10 pt-6 flex justify-between">
                  <span className="text-xl font-display font-bold">Total</span>
                  <span className="text-3xl font-display font-bold text-brand-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-brand-primary text-brand-dark font-bold py-6 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 group shadow-xl shadow-brand-primary/20"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span>Place Order</span>
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl overflow-hidden"
                  >
                    <p className="text-red-400 text-sm font-medium mb-1 flex items-center gap-2">
                       <Trash2 size={14} /> Something went wrong
                    </p>
                    <div className="text-red-200 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-center text-xs text-gray-500 mt-6 leading-relaxed">
                By ordering, you agree to Uncle Joe's Terms of Service and Privacy Policy.
              </p>

              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
