import { createContext, useContext, useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { companyAPI } from '../services/api';
import { formatCurrency, DEFAULT_CURRENCY } from '../utils/currency';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const { user } = useAuthStore();
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.company) {
      loadCompanyCurrency();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCompanyCurrency = async () => {
    try {
      const response = await companyAPI.getMyCompany();
      const companyCurrency = response.data.company?.currency || DEFAULT_CURRENCY;
      setCurrency(companyCurrency);
    } catch (error) {
      console.error('Failed to load company currency:', error);
      setCurrency(DEFAULT_CURRENCY);
    } finally {
      setLoading(false);
    }
  };

  const format = (amount) => formatCurrency(amount, currency);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export default CurrencyContext;
