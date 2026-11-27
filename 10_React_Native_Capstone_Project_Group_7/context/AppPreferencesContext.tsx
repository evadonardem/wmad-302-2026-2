import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppLanguage = 'en' | 'es';
export type ColorMode = 'light' | 'dark';

interface AppPreferences {
  language: AppLanguage;
  colorMode: ColorMode;
}

interface AppPreferencesContextValue extends AppPreferences {
  setLanguage: (language: AppLanguage) => Promise<void>;
  setColorMode: (mode: ColorMode) => Promise<void>;
  t: (key: string) => string;
}

const STORAGE_KEY = 'marketplace_app_preferences';
const DEFAULT_PREFERENCES: AppPreferences = { language: 'en', colorMode: 'light' };

const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    settings: 'Settings',
    orderNotifications: 'Order update notifications',
    dealNotifications: 'Flash deal notifications',
    darkMode: 'Dark mode',
    language: 'Language',
    english: 'English',
    spanish: 'Spanish',
    flashDeals: 'Flash deals',
    limitedTimePrices: 'Limited-time prices picked for you',
    endsIn: 'Ends in',
    coupon: 'Coupon code',
    applyCoupon: 'Apply',
    removeCoupon: 'Remove',
    couponApplied: 'Coupon applied',
    invalidCoupon: 'This coupon code is invalid or does not meet the minimum purchase.',
    couponDiscount: 'Coupon discount',
    reviewTitle: 'Write a review',
    reviewRating: 'Your rating',
    reviewComment: 'Your review',
    submitReview: 'Submit review',
    reviewRequired: 'Choose a rating and write a review.',
    reviewSaved: 'Your review was saved on this device.',
    localReviews: 'Reviews you add are saved on this device.',
    Shop: 'Shop',
    Categories: 'Categories',
    Cart: 'Cart',
    Profile: 'Profile',
    'Your next great find': 'Your next great find',
    'Shop your favorite finds': 'Shop your favorite finds',
    'Shopping Cart': 'Shopping Cart',
    Checkout: 'Checkout',
    Subtotal: 'Subtotal',
    Discount: 'Discount',
    Total: 'Total',
    'Delivery details': 'Delivery details',
    'Recipient name': 'Recipient name',
    'Delivery address': 'Delivery address',
    'Place order': 'Place order',
    'Order confirmed': 'Order confirmed',
    'Continue Shopping': 'Continue Shopping',
    'Your Cart is Empty': 'Your Cart is Empty',
    'Add some products to get started': 'Add some products to get started',
    'Customer reviews': 'Customer reviews',
    'No reviews yet.': 'No reviews yet.',
    'Product details': 'Product details',
    'Add to cart': 'Add to cart',
    'Out of stock': 'Out of stock',
    'Save method': 'Save method',
    'Flash deals are live': 'Flash deals are live',
    'Check out today’s limited-time marketplace deals.': 'Check out today’s limited-time marketplace deals.',
    Order: 'Order',
    'Your order has been placed.': 'Your order has been placed.',
    'Delivery tracking': 'Delivery tracking',
    'Tracking number': 'Tracking number',
    'Estimated delivery': 'Estimated delivery',
    Processing: 'Processing',
    Shipped: 'Shipped',
    'Out for delivery': 'Out for delivery',
    Delivered: 'Delivered',
    'Advance demo tracking': 'Advance demo tracking',
    'Simulated tracking only': 'Simulated tracking only',
    'Awaiting update': 'Awaiting update',
    'My Orders': 'My Orders',
    'Track and manage orders': 'Track and manage orders',
    Wishlist: 'Wishlist',
    'Saved items for later': 'Saved items for later',
    Addresses: 'Addresses',
    'Payment Methods': 'Payment Methods',
    'Edit Profile': 'Edit Profile',
    'Update your information': 'Update your information',
    Logout: 'Logout',
    'Are you sure you want to logout?': 'Are you sure you want to logout?',
    'Logout failed': 'Logout failed',
    'Your session could not be cleared. Please try again.': 'Your session could not be cleared. Please try again.',
    'Edit profile': 'Edit profile',
    'Order history': 'Order history',
    'Delivery addresses': 'Delivery addresses',
    'Order update notifications': 'Order update notifications',
    'No saved addresses.': 'No saved addresses.',
    'No saved payment methods.': 'No saved payment methods.',
    'Close': 'Close',
    Save: 'Save',
    Cancel: 'Cancel',
    "Shop smarter today": 'Shop smarter today',
    'Search products, brands and more': 'Search products, brands and more',
    "TODAY'S PICKS": "TODAY'S PICKS",
    'Deals worth discovering': 'Deals worth discovering',
    'Great finds. Great prices.': 'Great finds. Great prices.',
    'Shop now': 'Shop now',
    'Shop by category': 'Shop by category',
    'See all': 'See all',
    'Recommended for you': 'Recommended for you',
    'Popular finds across the marketplace': 'Popular finds across the marketplace',
    'Try again': 'Try again',
    'No products available right now.': 'No products available right now.',
    'Finding great deals...': 'Finding great deals...',
    'Ends in': 'Ends in',
    'Deals ended for today.': 'Deals ended for today.',
    'Could not load more. Tap to retry.': 'Could not load more. Tap to retry.',
    'Loading categories...': 'Loading categories...',
    'Browse products by category': 'Browse products by category',
    'Search products...': 'Search products...',
    All: 'All',
    'Brand and price': 'Brand and price',
    Brand: 'Brand',
    'Min price': 'Min price',
    'Max price': 'Max price',
    'Sort By': 'Sort By',
    Price: 'Price',
    Rating: 'Rating',
    Newest: 'Newest',
    Products: 'Products',
    'Load more': 'Load more',
    'Could not load products': 'Could not load products',
    Retry: 'Retry',
    'No products found': 'No products found',
    'Results for': 'Results for',
    'Try different filters or search terms.': 'Try different filters or search terms.',
    'In Stock': 'In Stock',
    'Out of Stock': 'Out of Stock',
    Marketplace: 'Marketplace',
    'Shop Smart, Save More': 'Shop Smart, Save More',
    'Welcome Back': 'Welcome Back',
    or: 'or sign in with',
    'Sign in to continue shopping': 'Sign in to continue shopping',
    'Username or Email': 'Username or Email',
    Password: 'Password',
    'Sign In': 'Sign In',
    'Try Demo Account (emilys / emilyspass)': 'Try Demo Account (emilys / emilyspass)',
    "Don't have an account? ": "Don't have an account? ",
    'Sign Up': 'Sign Up',
    'Create Your Account': 'Create Your Account',
    'Create Account': 'Create Account',
    'Start shopping smarter today': 'Start shopping smarter today',
    'First Name': 'First Name',
    'Last Name': 'Last Name',
    Username: 'Username',
    Email: 'Email',
    'Confirm Password': 'Confirm Password',
    'Age (Optional)': 'Age (Optional)',
    Gender: 'Gender',
    'Terms of Service': 'Terms of Service',
    'Privacy Policy': 'Privacy Policy',
    'Already have an account? ': 'Already have an account? ',
    Female: 'Female',
    Male: 'Male',
    'I agree to the': 'I agree to the',
  },
  es: {
    settings: 'Configuración',
    orderNotifications: 'Notificaciones de pedidos',
    dealNotifications: 'Notificaciones de ofertas',
    darkMode: 'Modo oscuro',
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',
    flashDeals: 'Ofertas relámpago',
    limitedTimePrices: 'Precios especiales por tiempo limitado',
    endsIn: 'Termina en',
    coupon: 'Código de cupón',
    applyCoupon: 'Aplicar',
    removeCoupon: 'Quitar',
    couponApplied: 'Cupón aplicado',
    invalidCoupon: 'El cupón no es válido o no cumple con la compra mínima.',
    couponDiscount: 'Descuento del cupón',
    reviewTitle: 'Escribir una reseña',
    reviewRating: 'Tu calificación',
    reviewComment: 'Tu reseña',
    submitReview: 'Enviar reseña',
    reviewRequired: 'Selecciona una calificación y escribe una reseña.',
    reviewSaved: 'Tu reseña se guardó en este dispositivo.',
    localReviews: 'Las reseñas que agregues se guardan en este dispositivo.',
    Shop: 'Tienda',
    Categories: 'Categorías',
    Cart: 'Carrito',
    Profile: 'Perfil',
    'Your next great find': 'Tu próximo gran hallazgo',
    'Shop your favorite finds': 'Compra tus productos favoritos',
    'Shopping Cart': 'Carrito de compras',
    Checkout: 'Pagar',
    Subtotal: 'Subtotal',
    Discount: 'Descuento',
    Total: 'Total',
    'Delivery details': 'Datos de entrega',
    'Recipient name': 'Nombre del destinatario',
    'Delivery address': 'Dirección de entrega',
    'Place order': 'Realizar pedido',
    'Order confirmed': 'Pedido confirmado',
    'Continue Shopping': 'Seguir comprando',
    'Your Cart is Empty': 'Tu carrito está vacío',
    'Add some products to get started': 'Agrega productos para comenzar',
    'Customer reviews': 'Reseñas de clientes',
    'No reviews yet.': 'Aún no hay reseñas.',
    'Product details': 'Detalles del producto',
    'Add to cart': 'Agregar al carrito',
    'Out of stock': 'Agotado',
    'Save method': 'Guardar método',
    'Flash deals are live': 'Las ofertas relámpago están activas',
    'Check out today’s limited-time marketplace deals.': 'Descubre las ofertas del mercado por tiempo limitado.',
    Order: 'Pedido',
    'Your order has been placed.': 'Tu pedido ha sido realizado.',
    'Delivery tracking': 'Seguimiento de entrega',
    'Tracking number': 'Número de seguimiento',
    'Estimated delivery': 'Entrega estimada',
    Processing: 'En preparación',
    Shipped: 'Enviado',
    'Out for delivery': 'En reparto',
    Delivered: 'Entregado',
    'Advance demo tracking': 'Avanzar seguimiento de demostración',
    'Simulated tracking only': 'Seguimiento simulado',
    'Awaiting update': 'Pendiente',
    'My Orders': 'Mis pedidos',
    'Track and manage orders': 'Consulta y administra tus pedidos',
    Wishlist: 'Lista de deseos',
    'Saved items for later': 'Productos guardados',
    Addresses: 'Direcciones',
    'Payment Methods': 'Métodos de pago',
    'Edit Profile': 'Editar perfil',
    'Update your information': 'Actualiza tu información',
    Logout: 'Cerrar sesión',
    'Are you sure you want to logout?': '¿Seguro que quieres cerrar sesión?',
    'Logout failed': 'Error al cerrar sesión',
    'Your session could not be cleared. Please try again.': 'No se pudo borrar tu sesión. Inténtalo de nuevo.',
    'Edit profile': 'Editar perfil',
    'Order history': 'Historial de pedidos',
    'Delivery addresses': 'Direcciones de entrega',
    'Order update notifications': 'Notificaciones de pedidos',
    'No saved addresses.': 'No hay direcciones guardadas.',
    'No saved payment methods.': 'No hay métodos de pago guardados.',
    'Close': 'Cerrar',
    Save: 'Guardar',
    Cancel: 'Cancelar',
    "Shop smarter today": 'Compra de forma inteligente',
    'Search products, brands and more': 'Buscar productos, marcas y más',
    "TODAY'S PICKS": 'SELECCIÓN DE HOY',
    'Deals worth discovering': 'Ofertas que vale la pena descubrir',
    'Great finds. Great prices.': 'Grandes hallazgos. Grandes precios.',
    'Shop now': 'Comprar ahora',
    'Shop by category': 'Comprar por categoría',
    'See all': 'Ver todo',
    'Recommended for you': 'Recomendado para ti',
    'Popular finds across the marketplace': 'Productos populares del mercado',
    'Try again': 'Intentar de nuevo',
    'No products available right now.': 'No hay productos disponibles ahora.',
    'Finding great deals...': 'Buscando buenas ofertas...',
    'Ends in': 'Termina en',
    'Deals ended for today.': 'Las ofertas de hoy han terminado.',
    'Could not load more. Tap to retry.': 'No se pudieron cargar más. Toca para reintentar.',
    'Loading categories...': 'Cargando categorías...',
    'Browse products by category': 'Explora productos por categoría',
    'Search products...': 'Buscar productos...',
    All: 'Todo',
    'Brand and price': 'Marca y precio',
    Brand: 'Marca',
    'Min price': 'Precio mínimo',
    'Max price': 'Precio máximo',
    'Sort By': 'Ordenar por',
    Price: 'Precio',
    Rating: 'Calificación',
    Newest: 'Más recientes',
    Products: 'Productos',
    'Load more': 'Cargar más',
    'Could not load products': 'No se pudieron cargar los productos',
    Retry: 'Reintentar',
    'No products found': 'No se encontraron productos',
    'Results for': 'Resultados para',
    'Try different filters or search terms.': 'Prueba otros filtros o términos de búsqueda.',
    'In Stock': 'Disponible',
    'Out of Stock': 'Agotado',
    Marketplace: 'Mercado',
    'Shop Smart, Save More': 'Compra mejor, ahorra más',
    'Welcome Back': 'Bienvenido de nuevo',
    or: 'o inicia sesión con',
    'Sign in to continue shopping': 'Inicia sesión para seguir comprando',
    'Username or Email': 'Usuario o correo electrónico',
    Password: 'Contraseña',
    'Sign In': 'Iniciar sesión',
    'Try Demo Account (emilys / emilyspass)': 'Probar cuenta de demostración (emilys / emilyspass)',
    "Don't have an account? ": '¿No tienes una cuenta? ',
    'Sign Up': 'Registrarse',
    'Create Your Account': 'Crea tu cuenta',
    'Create Account': 'Crear cuenta',
    'Start shopping smarter today': 'Empieza a comprar mejor hoy',
    'First Name': 'Nombre',
    'Last Name': 'Apellido',
    Username: 'Usuario',
    Email: 'Correo electrónico',
    'Confirm Password': 'Confirmar contraseña',
    'Age (Optional)': 'Edad (opcional)',
    Gender: 'Género',
    'Terms of Service': 'Términos del servicio',
    'Privacy Policy': 'Política de privacidad',
    'Already have an account? ': '¿Ya tienes una cuenta? ',
    Female: 'Mujer',
    Male: 'Hombre',
    'I agree to the': 'Acepto los',
  },
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | undefined>(undefined);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored || !active) return;
        const parsed: unknown = JSON.parse(stored);
        if (!parsed || typeof parsed !== 'object') return;
        const saved = parsed as Partial<AppPreferences>;
        if (saved.language === 'en' || saved.language === 'es') {
          setPreferences((current) => ({ ...current, language: saved.language! }));
        }
        if (saved.colorMode === 'light' || saved.colorMode === 'dark') {
          setPreferences((current) => ({ ...current, colorMode: saved.colorMode! }));
        }
      })
      .catch((error: unknown) => console.error('Could not load app preferences:', error));
    return () => {
      active = false;
    };
  }, []);

  const savePreference = useCallback(async (updated: AppPreferences) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPreferences(updated);
  }, []);

  const setLanguage = useCallback(
    (language: AppLanguage) => savePreference({ ...preferences, language }),
    [preferences, savePreference]
  );
  const setColorMode = useCallback(
    (colorMode: ColorMode) => savePreference({ ...preferences, colorMode }),
    [preferences, savePreference]
  );
  const t = useCallback(
    (key: string) => translations[preferences.language][key] ?? key,
    [preferences.language]
  );

  const value = useMemo(
    () => ({ ...preferences, setLanguage, setColorMode, t }),
    [preferences, setLanguage, setColorMode, t]
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences(): AppPreferencesContextValue {
  const context = useContext(AppPreferencesContext);
  if (!context) throw new Error('useAppPreferences must be used within an AppPreferencesProvider');
  return context;
}
