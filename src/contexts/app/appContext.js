import axios from 'axios';
import {
  useReducer,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  createContext,
} from 'react';

import reducer from './reducers';

import {
  DISPLAY_ALERT,
  CLEAR_ALERT,
  SETUP_BEGIN,
  SETUP_USER_SUCCESS,
  SETUP_FAILURE,
  TOGGLE_SIDEBAR,
  LOGOUT_USER,
  FETCH_CATEGORY_OPTIONS_SUCCESS,
  FETCH_TRANSACTION_TYPES_SUCCESS,
  HANDLE_TRANSACTION_INPUT,
  CLEAR_TRANSACTION_FORM_VALUES,
  CREATE_TRANSACTION_SUCCESS,
  FETCH_TRANSACTIONS_SUCCESS,
  SET_EDIT_TRANSACTION,
  FETCH_TRANSACTION_STATS_SUCCESS,
  CLEAR_FILTERS,
  CHANGE_PAGE,
} from './actions';

const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

const transactionInitialState = {
  transactionDescription: '',
  transactionAmount: 1,
  transactionType: 1,
  transactionDate: new Date().toISOString().split('T')[0],
  transactionCategory: 1,
};

const searchTransactionsInitialState = {
  search: '',
  searchType: 'all',
  searchCategory: 'all',
  sort: 'desc',
};

const initialState = {
  isLoading: false,
  showAlert: false,
  alertMessage: '',
  alertType: '',
  user: user ? JSON.parse(user) : null,
  token: token ? token : null,
  sidebarOpen: false,

  isEditing: false,
  editTransactionId: null,

  ...transactionInitialState,
  ...searchTransactionsInitialState,
  sortOptions: [
    { id: 'desc', name: 'Descendente' },
    { id: 'asc', name: 'Ascendente' },
  ],

  transactionStats: {
    groupByType: [],
    groupByCategory: [],
    groupByLastSixMonths: [],
  },

  categoryOptions: [],
  transactionTypes: [],

  transactions: [],
  totalTransactions: 0,
  numOfPages: 1,
  currentPage: 1,
};

const AppContext = createContext(initialState);

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const client = useMemo(
    () =>
      axios.create({
        baseURL: process.env.REACT_APP_SERVER_URL + '/api/v1',
        headers: {
          Authorization: `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
      }),
    [state.token]
  );

  const clearAlert = useCallback(() => {
    dispatch({
      type: CLEAR_ALERT,
    });
  }, []);

  const logoutUser = useCallback(() => {
    dispatch({
      type: LOGOUT_USER,
    });
    removeUserFromLocalStorage();
  }, []);

  useEffect(() => {
    client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const { response } = error;
        if (response.status === 401 || response.status === 403) {
          logoutUser();
        }
        return Promise.reject(error);
      }
    );
  }, [state.token, client, logoutUser]);

  const displayAlert = (message, type) => {
    dispatch({
      type: DISPLAY_ALERT,
      payload: { message, type },
    });
  };

  const addUserToLocalStorage = (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const removeUserFromLocalStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const setupUser = async (user, endpoint, message) => {
    dispatch({
      type: SETUP_BEGIN,
    });

    try {
      const { data } = await client.post(`/users/${endpoint}`, user);
      const { user: newUser, token } = data.result;
      dispatch({
        type: SETUP_USER_SUCCESS,
        payload: { user: newUser, token, message },
      });
      addUserToLocalStorage(newUser, token);
    } catch (error) {
      dispatch({
        type: SETUP_FAILURE,
        payload: { message: error.response.data.message },
      });
    }
  };

  const toggleSidebar = () => {
    dispatch({
      type: TOGGLE_SIDEBAR,
    });
  };

  const updateUser = async (currentUser) => {
    dispatch({
      type: SETUP_BEGIN,
    });

    try {
      const { data } = await client.put(`/users/update`, currentUser);
      const { user, token } = data.result;
      dispatch({
        type: SETUP_USER_SUCCESS,
        payload: { user, token, message: data.message },
      });
      addUserToLocalStorage(user, token);
    } catch (error) {
      dispatch({
        type: SETUP_FAILURE,
        payload: { message: error.response.data.message },
      });
    }
  };

  const updatePassword = async (newPassword) => {
    dispatch({
      type: SETUP_BEGIN,
    });

    try {
      const { data } = await client.put(`/users/update-password`, {
        password: newPassword,
      });

      const { message } = data.result;
      dispatch({
        type: SETUP_USER_SUCCESS,
        payload: { user: state.user, token: state.token, message },
      });
      addUserToLocalStorage(user, token);
      clearAlert();
      logoutUser();
    } catch (error) {
      dispatch({
        type: SETUP_FAILURE,
        payload: { message: error.response.data.message },
      });
    }
  };

  const fetchCategoryOptions = useCallback(async () => {
    dispatch({
      type: SETUP_BEGIN,
    });
    try {
      const { data } = await client.get('/categories');
      dispatch({
        type: FETCH_CATEGORY_OPTIONS_SUCCESS,
        payload: data.result,
      });
      clearAlert();
    } catch (error) {
      dispatch({
        type: SETUP_FAILURE,
        payload: { message: error.response.data.message },
      });
    }
  }, [client, clearAlert]);

  const fetchTransactionTypes = useCallback(async () => {
    dispatch({
      type: SETUP_BEGIN,
    });
    try {
      const { data } = await client.get('/transaction-types');
      dispatch({
        type: FETCH_TRANSACTION_TYPES_SUCCESS,
        payload: data.result,
      });
      clearAlert();
    } catch (error) {
      dispatch({
        type: SETUP_FAILURE,
        payload: { message: error.response.data.message },
      });
    }
  }, [client, clearAlert]);

  const handleInputChange = (field, value) => {
    dispatch({
      type: HANDLE_TRANSACTION_INPUT,
      payload: { field, value },
    });
  };

  const clearTransactionForm = () => {
    dispatch({
      type: CLEAR_TRANSACTION_FORM_VALUES,
    });
    clearAlert();
  };

  const createTransaction = async () => {
    dispatch({
      type: SETUP_BEGIN,
    });

    try {
      const {
        transactionDescription: description,
        transactionAmount: amount,
        transactionType: type,
        transactionDate: date,
        transactionCategory: category_id,
      } = state;
      const { data } = await client.post('/transactions/add', {
        description,
        amount,
        type,
        date,
        category_id,
      });

      const { message } = data;
      dispatch({
        type: CREATE_TRANSACTION_SUCCESS,
        payload: { message },
      });
      dispatch({
        type: CLEAR_TRANSACTION_FORM_VALUES,
      });
    } catch (error) {
      dispatch({
        type: SETUP_FAILURE,
        payload: { message: error.response.data.message },
      });
    }
  };

  const getTransactions = useCallback(async () => {
    let url = `/transactions?page=${state.currentPage}&type=${state.searchType}&category=${state.searchCategory}&sort=${state.sort}`;
    if (state.search && state.search.trim() !== '') {
      url = `${url}&search=${state.search}`;
    }
    dispatch({
      type: SETUP_BEGIN,
    });

    try {
      const { data } = await client.get(url);
      const { transactions, total, numOfPages } = data.result;
      dispatch({
        type: FETCH_TRANSACTIONS_SUCCESS,
        payload: {
          transactions,
          total,
          numOfPages,
        },
      });
      clearAlert();
    } catch (error) {
      dispatch({
        type: SETUP_FAILURE,
        payload: { message: error.response.data.message },
      });
    }
  }, [
    client,
    clearAlert,
    state.search,
    state.searchType,
    state.searchCategory,
    state.sort,
    state.currentPage,
  ]);

  const setEditTransaction = (transactionId) => {
    dispatch({
      type: SET_EDIT_TRANSACTION,
      payload: transactionId,
    });
  };

  const deleteTransaction = async (transactionId) => {
    dispatch({
      type: SETUP_BEGIN,
    });

    try {
      const { data } = await client.delete(`/transactions/${transactionId}`);
      const { message } = data;
      await getTransactions();
      dispatch({
        type: DISPLAY_ALERT,
        payload: { message, type: 'success' },
      });
    } catch (error) {
      dispatch({
        type: SETUP_FAILURE,
        payload: { message: error.response.data.message },
      });
    }
  };

  const editTransaction = async () => {
    dispatch({
      type: SETUP_BEGIN,
    });

    try {
      const {
        transactionDescription: description,
        transactionAmount: amount,
        transactionDate: date,
        transactionCategory: category_id,
      } = state;
      const { data } = await client.put(
        `/transactions/${state.editTransactionId}`,
        {
          description,
          amount,
          date,
          category_id,
        }
      );
      const { message } = data;
      dispatch({
        type: DISPLAY_ALERT,
        payload: { message, type: 'success' },
      });
      dispatch({
        type: CLEAR_TRANSACTION_FORM_VALUES,
      });
    } catch (error) {
      dispatch({
        type: SETUP_FAILURE,
        payload: { message: error.response.data.message },
      });
    }
  };

  const fetchTransactionStats = useCallback(async () => {
    dispatch({
      type: SETUP_BEGIN,
    });
    try {
      const { data } = await client.get('/transactions/stats');
      dispatch({
        type: FETCH_TRANSACTION_STATS_SUCCESS,
        payload: data.result,
      });
      clearAlert();
    } catch (error) {
      dispatch({
        type: SETUP_FAILURE,
        payload: { message: error.response.data.message },
      });
    }
  }, [client, clearAlert]);

  const clearFilters = () => {
    dispatch({
      type: CLEAR_FILTERS,
    });
  };

  const changePage = (page) => {
    dispatch({
      type: CHANGE_PAGE,
      payload: page,
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        displayAlert,
        clearAlert,
        setupUser,
        toggleSidebar,
        logoutUser,
        updateUser,
        updatePassword,
        fetchCategoryOptions,
        fetchTransactionTypes,
        handleInputChange,
        clearTransactionForm,
        createTransaction,
        getTransactions,
        setEditTransaction,
        deleteTransaction,
        editTransaction,
        fetchTransactionStats,
        clearFilters,
        changePage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

export {
  AppContext,
  AppProvider,
  useAppContext,
  initialState,
  transactionInitialState,
  searchTransactionsInitialState,
};
