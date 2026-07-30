import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Plot, User, Booking, Transaction, UserRole } from '../types';
import { INITIAL_USERS, generatePlots, INITIAL_BOOKINGS, INITIAL_TRANSACTIONS } from '../data/seedData';

interface AppContextType {
  plots: Plot[];
  users: User[];
  bookings: Booking[];
  transactions: Transaction[];
  currentUser: User;
  setCurrentUserRole: (role: UserRole) => void;
  setCurrentUserId: (id: string) => void;
  bookPlot: (bookingData: Omit<Booking, 'bookingId' | 'bookingDate' | 'status' | 'balanceDue' | 'registryDueDate'>) => Booking;
  verifyPayment: (txnId: string, isApproved: boolean) => void;
  wipeOutBooking: (plotId: string) => void;
  registerAssociate: (name: string, phone: string, email: string, parentId: string) => User;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PLOTS: 'sgc_crm_plots_v980_no_overlap_final_v2',
  USERS: 'sgc_crm_users_v980_no_overlap_final_v2',
  BOOKINGS: 'sgc_crm_bookings_v980_no_overlap_final_v2',
  TRANSACTIONS: 'sgc_crm_transactions_v980_no_overlap_final_v2',
  CURRENT_USER_ID: 'sgc_crm_current_user_id_v980_no_overlap_final_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial clean states (0 Booked, 0 Sold, 980 Available)
  const [plots, setPlots] = useState<Plot[]>(() => {
    // Clear any outdated cache from older keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sgc_crm_plots') && key !== STORAGE_KEYS.PLOTS) {
        localStorage.removeItem(key);
      }
    }

    const saved = localStorage.getItem(STORAGE_KEYS.PLOTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Force refresh if cached plots have old overlapping coordinates (B-317 y < 2000)
        const b317 = parsed.find((p: Plot) => p.id === 'B-317');
        if (Array.isArray(parsed) && parsed.length >= 900 && b317 && b317.y > 2000) {
          return parsed;
        }
      } catch (_e) {
        console.warn('Resetting plots to fresh non-overlapping state...');
      }
    }
    return generatePlots();
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [currentUserId, setCurrentUserIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'SGC-ADM01';
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLOTS, JSON.stringify(plots));
  }, [plots]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const setCurrentUserRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUserIdState(targetUser.id);
    }
  };

  const setCurrentUserId = (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    if (targetUser) {
      setCurrentUserIdState(targetUser.id);
    }
  };

  // Module 3: Booking Form Submission
  const bookPlot = (
    bookingData: Omit<Booking, 'bookingId' | 'bookingDate' | 'status' | 'balanceDue' | 'registryDueDate'>
  ): Booking => {
    const newBookingId = `BK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 90);
    const registryDueDate = dueDate.toISOString().split('T')[0];

    const balanceDue = bookingData.totalAmount - bookingData.bookingAmount;

    const newBooking: Booking = {
      ...bookingData,
      bookingId: newBookingId,
      bookingDate: today,
      status: 'pending_verification',
      balanceDue,
      registryDueDate,
    };

    const newTxnId = `TXN-${Math.floor(100 + Math.random() * 900)}`;
    const newTxn: Transaction = {
      txnId: newTxnId,
      bookingId: newBookingId,
      plotId: bookingData.plotId,
      customerName: bookingData.customerName,
      amount: bookingData.bookingAmount,
      utrNumber: bookingData.utrNumber,
      paymentMode: bookingData.paymentMode,
      date: today,
      verificationStatus: 'pending',
    };

    setPlots((prevPlots) =>
      prevPlots.map((p) =>
        p.id === bookingData.plotId
          ? { ...p, status: 'booked', bookingId: newBookingId }
          : p
      )
    );

    setBookings((prev) => [newBooking, ...prev]);
    setTransactions((prev) => [newTxn, ...prev]);

    return newBooking;
  };

  // Module 4: Payment Verification by Accountant
  const verifyPayment = (txnId: string, isApproved: boolean) => {
    const txn = transactions.find((t) => t.txnId === txnId);
    if (!txn) return;

    const newStatus = isApproved ? 'approved' : 'rejected';

    setTransactions((prev) =>
      prev.map((t) =>
        t.txnId === txnId
          ? { ...t, verificationStatus: newStatus, verifiedBy: `${currentUser.name} (${currentUser.role})` }
          : t
      )
    );

    if (isApproved) {
      const booking = bookings.find((b) => b.bookingId === txn.bookingId);
      if (booking) {
        setBookings((prev) =>
          prev.map((b) =>
            b.bookingId === booking.bookingId ? { ...b, status: 'sold' } : b
          )
        );

        setPlots((prev) =>
          prev.map((p) =>
            p.id === booking.plotId ? { ...p, status: 'sold' } : p
          )
        );

        const commissionAmount = booking.totalAmount * 0.05;
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === booking.associateId) {
              return {
                ...u,
                totalBookingsCount: u.totalBookingsCount + 1,
                totalSalesVolume: u.totalSalesVolume + booking.totalAmount,
                totalCommissionEarned: u.totalCommissionEarned + commissionAmount,
                commissionPending: u.commissionPending + commissionAmount,
              };
            }
            return u;
          })
        );
      }
    }
  };

  // Module 1: Admin "Wipe Out" / Reset Inventory Feature
  const wipeOutBooking = (plotId: string) => {
    const targetPlot = plots.find((p) => p.id === plotId);
    if (!targetPlot || !targetPlot.bookingId) return;

    const bookingIdToCancel = targetPlot.bookingId;

    setPlots((prev) =>
      prev.map((p) =>
        p.id === plotId ? { ...p, status: 'available', bookingId: undefined } : p
      )
    );

    setBookings((prev) =>
      prev.map((b) =>
        b.bookingId === bookingIdToCancel ? { ...b, status: 'cancelled' } : b
      )
    );
  };

  // Module 2: Associate Onboarding
  const registerAssociate = (
    name: string,
    phone: string,
    email: string,
    parentId: string
  ): User => {
    const nextNum = users.filter((u) => u.role === 'associate').length + 1;
    const newId = `SGC-A${nextNum.toString().padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newUser: User = {
      id: newId,
      name,
      role: 'associate',
      phone,
      email,
      parentId,
      downlineIds: [],
      joinedDate: today,
      totalBookingsCount: 0,
      totalSalesVolume: 0,
      totalCommissionEarned: 0,
      commissionPaid: 0,
      commissionPending: 0,
    };

    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === parentId) {
          return {
            ...u,
            downlineIds: [...(u.downlineIds || []), newId],
          };
        }
        return u;
      });
      return [...updated, newUser];
    });

    return newUser;
  };

  const resetAllData = () => {
    localStorage.clear();
    setPlots(generatePlots());
    setUsers(INITIAL_USERS);
    setBookings([]);
    setTransactions([]);
    setCurrentUserIdState('SGC-ADM01');
  };

  return (
    <AppContext.Provider
      value={{
        plots,
        users,
        bookings,
        transactions,
        currentUser,
        setCurrentUserRole,
        setCurrentUserId,
        bookPlot,
        verifyPayment,
        wipeOutBooking,
        registerAssociate,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
