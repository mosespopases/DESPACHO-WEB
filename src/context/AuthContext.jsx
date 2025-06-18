// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);         // Usuario auth
  const [userData, setUserData] = useState(null); // Datos extendidos (tabla usuarios)
  const [session, setSession] = useState(null);   // Sesión actual
  const [loading, setLoading] = useState(true);   // Estado de carga

  // Cargar datos extendidos del usuario
  const fetchUserData = async (email) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.warn("Usuario no encontrado en tabla usuarios:", error.message);
      setUserData(null);
    } else {
      setUserData(data);
    }
  };

  // Cerrar sesión y limpiar estado
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
    setSession(null);
  };

  // Obtener sesión al montar el componente
  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      setSession(session || null);
      setUser(session?.user || null);

      if (session?.user?.email) {
        await fetchUserData(session.user.email);
      }

      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (session?.user?.email) {
        fetchUserData(session.user.email);
      } else {
        setUserData(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return context;
};