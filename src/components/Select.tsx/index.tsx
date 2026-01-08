import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { 
  TextInput, 
  Text, 
  RadioButton, 
  Button, 
  useTheme, 
  Dialog, 
  Portal, 
  TouchableRipple 
} from 'react-native-paper';

type OptionObject = {
  label: string;
  value: string;
};

type SelectOption = string | OptionObject;

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  icon?: string | null; 
}

export default function Select({ 
  label, 
  value, 
  options = [], 
  onSelect, 
  placeholder = "Selecione...",
  error = false,
  icon = null 
}: SelectProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);


  const formattedOptions = useMemo<OptionObject[]>(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt;
    });
  }, [options]);

  const selectedLabel = useMemo(() => {
    const found = formattedOptions.find((opt) => opt.value === value);
    return found ? found.label : '';
  }, [value, formattedOptions]);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);


  const handleSelect = (val: string) => {
    onSelect(val);
    hideDialog();
  };

  return (
    <>
      <TouchableOpacity onPress={showDialog} activeOpacity={0.7}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            placeholder={placeholder}
            value={selectedLabel}
            editable={false}
            error={error}
            left={icon ? <TextInput.Icon icon={icon} color={theme.colors.secondary} /> : null}
            right={<TextInput.Icon icon="menu-down" />} 
            style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
          />
        </View>
      </TouchableOpacity>

      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog} style={{ maxHeight: '80%' }}>
          <Dialog.Title>{label}</Dialog.Title>
          
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 0 }}>
              <RadioButton.Group onValueChange={handleSelect} value={value}>
                {formattedOptions.map((opt) => (
                  <TouchableRipple 
                    key={opt.value} 
                    onPress={() => handleSelect(opt.value)}
                    style={styles.radioContainer}
                  >
                    <View style={styles.radioRow}>
                      <RadioButton.Android 
                        value={opt.value} 
                        color={theme.colors.primary} 
                      />
                      <Text variant="bodyLarge" style={{ marginLeft: 8 }}>
                        {opt.label}
                      </Text>
                    </View>
                  </TouchableRipple>
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>

          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  radioContainer: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});