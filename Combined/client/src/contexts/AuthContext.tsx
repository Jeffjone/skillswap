import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';

interface AuthContextType {
    currentUser: User | null;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = window.firebase.auth().onAuthStateChanged(setCurrentUser);
        return unsubscribe;
    }, []);

    const logout = async () => {
        await window.firebase.auth().signOut();
    };

    return (
        <AuthContext.Provider value={{ currentUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}; 