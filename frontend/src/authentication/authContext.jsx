import { createContext, useContext, useEffect, useRef, useState, } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseAuth";
import { getMe } from "../services/userService";

const AuthContext = createContext();

const SESSION_TIMEOUT = 60 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const sessionTimerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);

        if (firebaseUser) {
          const data = await getMe();
          setUserData(data);
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.error("LOAD USER DATA ERROR:", err);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);


  async function logout() {
    try {
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }

      await signOut(auth);
    } catch (err) {
      console.error("LOGOUT ERROR:", err);
    }
  }

  useEffect(() => {
    if (!user) {
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }

      return;
    }

    const resetSessionTimer = () => {
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
      }

      sessionTimerRef.current = setTimeout(() => {
        console.log("Session expired due to inactivity");
        logout();
      }, SESSION_TIMEOUT);
    };

    const activityEvents = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetSessionTimer);
    });


    resetSessionTimer();

    return () => {
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetSessionTimer);
      });
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        isAdmin: userData?.role === "admin",
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}