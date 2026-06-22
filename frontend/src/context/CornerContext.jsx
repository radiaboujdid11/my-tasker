import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CORNERS, makeCustomCorner } from '../config/corners';
import { getUserCorners, createUserCorner, deleteUserCorner } from '../services/api';
import { useAuth } from './AuthContext';

const CornerContext = createContext(null);

export function CornerProvider({ children }) {
  const { user } = useAuth();
  const [activeCorner, setActiveCorner] = useState(
    () => localStorage.getItem('activeCorner') || 'tasks'
  );
  const [customCorners, setCustomCorners] = useState([]);   // raw DB rows
  const [loadingCorners, setLoadingCorners] = useState(false);

  // Load user's custom corners whenever they log in
  useEffect(() => {
    if (!user) { setCustomCorners([]); return; }
    setLoadingCorners(true);
    getUserCorners()
      .then((res) => setCustomCorners(res.data))
      .catch(() => {})
      .finally(() => setLoadingCorners(false));
  }, [user]);

  /** All corners merged: built-ins + custom */
  const allCorners = {
    ...CORNERS,
    ...Object.fromEntries(customCorners.map((r) => [`c_${r.id}`, makeCustomCorner(r)])),
  };

  const changeCorner = useCallback((id) => {
    setActiveCorner(id);
    localStorage.setItem('activeCorner', id);
  }, []);

  const addCorner = useCallback(async (data) => {
    const res = await createUserCorner(data);
    setCustomCorners((prev) => [...prev, res.data]);
    changeCorner(`c_${res.data.id}`);
    return res.data;
  }, [changeCorner]);

  const removeCorner = useCallback(async (dbId) => {
    await deleteUserCorner(dbId);
    setCustomCorners((prev) => prev.filter((r) => r.id !== dbId));
    // If we were on the deleted corner, fall back to tasks
    if (activeCorner === `c_${dbId}`) changeCorner('tasks');
  }, [activeCorner, changeCorner]);

  return (
    <CornerContext.Provider value={{
      activeCorner, changeCorner,
      customCorners, allCorners,
      addCorner, removeCorner,
      loadingCorners,
    }}>
      {children}
    </CornerContext.Provider>
  );
}

export function useCorner() {
  return useContext(CornerContext);
}
