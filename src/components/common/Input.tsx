import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {leftIcon && (
          <Icon 
            name={leftIcon} 
            size={20} 
            color={error ? '#E74C3C' : '#666'} 
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#999"
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
          >
            <Icon 
              name={rightIcon} 
              size={20} 
              color={error ? '#E74C3C' : '#666'} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FDF2F2',
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  rightIconContainer: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
    marginLeft: 4,
  },
});