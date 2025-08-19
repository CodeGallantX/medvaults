import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react-native';

export const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme}>
      {theme === 'light' ? <Moon size={24} color="black" /> : <Sun size={24} color="white" />}
    </TouchableOpacity>
  );
};
