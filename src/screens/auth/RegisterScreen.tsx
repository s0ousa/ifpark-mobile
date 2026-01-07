 
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme, IconButton } from 'react-native-paper';

export default function RegisterScreen({ navigation }: any) {
  const theme = useTheme();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    console.log('Registrar:', { name, email });
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        
        <Surface 
          elevation={0}
          style={{
            backgroundColor: theme.colors.primary, 
            paddingTop: 60, 
            paddingBottom: 6,
            paddingHorizontal: 20,
          }} 
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton 
              icon="arrow-left" 
              iconColor={theme.colors.onPrimary}
              size={24}
              onPress={() => navigation.goBack()}
              style={{ marginLeft: -10 }} 
            />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.onPrimary }}>
              Criar Conta
            </Text>
          </View>
        </Surface>

        <View style={{ flex: 1, padding: 24 }}>
            
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' }}>
              Nome Completo
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Seu nome"
              value={name}
              onChangeText={setName}
              left={<TextInput.Icon icon="account" color={theme.colors.secondary} />}
              style={{ backgroundColor: theme.colors.surface }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              outlineStyle={{ borderRadius: 8 }}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' }}>
              Email
            </Text>
            <TextInput
              mode="outlined"
              placeholder="seu.email@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" color={theme.colors.secondary} />}
              style={{ backgroundColor: theme.colors.surface }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              outlineStyle={{ borderRadius: 8 }}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' }}>
              Senha
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Crie uma senha"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              left={<TextInput.Icon icon="lock" color={theme.colors.secondary} />}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)} 
                />
              }
              style={{ backgroundColor: theme.colors.surface }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              outlineStyle={{ borderRadius: 8 }}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleRegister}
            style={{ marginTop: 16, borderRadius: 8 }}
            contentStyle={{ paddingVertical: 8 }}
          >
            Cadastrar
          </Button>
          
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Login')}
            textColor={theme.colors.secondary}
            style={{ marginTop: 16 }}
          >
            Já tenho conta
          </Button>

        </View>
      </View>
    </ScrollView>
  );
}