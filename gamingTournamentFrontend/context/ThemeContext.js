import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme } from '../constants/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setTheme] = useState(systemColorScheme === 'dark' ? 'dark' : 'light');
    const [colors, setColors] = useState(theme === 'dark' ? DarkTheme : LightTheme);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem('appTheme');
                if (storedTheme) {
                    setTheme(storedTheme);
                }
            } catch (error) {
                console.log('Failed to load theme', error);
            }
        };
        loadTheme();
    }, []);

    useEffect(() => {
        setColors(theme === 'dark' ? DarkTheme : LightTheme);
        AsyncStorage.setItem('appTheme', theme).catch(err => console.log('Failed to save theme', err));
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
