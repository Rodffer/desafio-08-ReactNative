import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketplace:cart');

      cart && setProducts(JSON.parse(cart));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productAddedExists = products.find(p => p.id === product.id);
      if (productAddedExists) {
        products.map<Product>(productOnCart => {
          productOnCart.id === productAddedExists.id
            ? (productOnCart.quantity += 1)
            : productOnCart.quantity;
        });

        setProducts(products);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      }
      console.log(`Produto adicionado no carrinho`);
      products.map(p => {
        console.log(`Nome: ${p.title} - Quantidade: ${p.quantity}`);
      });
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsIncremented = products.map<Product>(product => {
        if (product.id === id) {
          product.quantity += 1;
        }
        return product;
      });

      setProducts(productsIncremented);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productsIncremented),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsDecremented = products.map<Product>(product => {
        if (product.id === id) {
          product.quantity -= 1;
          return product;
        }
      });

      setProducts(productsDecremented);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productsDecremented),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
