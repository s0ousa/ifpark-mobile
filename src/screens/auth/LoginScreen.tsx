import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme, Icon } from 'react-native-paper';

export default function LoginScreen() {
  // HOOK DO TEMA: É aqui que puxamos as cores definidas no arquivo theme
  const theme = useTheme(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      console.log('Login:', { email, password });
      setLoading(false);
    }, 1500);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        
        {/* HEADER: Usa a cor Primária (Verde Escuro #075E54) */}
       <Surface 
          elevation={0}
          style={{
            backgroundColor: theme.colors.primary, 
            paddingTop: 120,
            paddingBottom: 40,
            alignItems: 'center',
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }} 
        >
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8 
          }}>
                <Icon
                    source="car-estate"
                    color={theme.colors.tertiary}
                    size={45} 
                />
                <Text style={{ 
                    fontSize: 32, 
                    fontWeight: 'bold', 
                    color: theme.colors.onPrimary, 
                    marginLeft: 6 // <--- Espaçamento entre o ícone e o nome
                }}>
                    IfPark
                </Text>
          </View>
            
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' }}>
            Sistema Gerenciador de Estacionamentos do IFBA
          </Text>
        </Surface>

        {/* FORMULÁRIO */}
        <View style={{ flex: 1, padding: 24 }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 24,
            marginTop: 8,
          }}>
            Bem-vindo(a)
          </Text>

          {/* INPUT EMAIL */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' }}>
              Email
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Digite seu email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              // Ícone usa a cor secundária (Verde Médio #128C7E)
              left={<TextInput.Icon icon="email" color={theme.colors.secondary} />}
              style={{ backgroundColor: theme.colors.surface }}
              // Borda inativa cinza, borda ativa Verde Escuro
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              outlineStyle={{ borderRadius: 8 }}
            />
          </View>

          {/* INPUT SENHA */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' }}>
              Senha
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={securePassword}
              left={<TextInput.Icon icon="lock" color={theme.colors.secondary} />}
              right={
                <TextInput.Icon
                  icon={securePassword ? 'eye' : 'eye-off'}
                  onPress={() => setSecurePassword(!securePassword)}
                  color="#9CA3AF"
                />
              }
              style={{ backgroundColor: theme.colors.surface }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              outlineStyle={{ borderRadius: 8 }}
            />
          </View>

          {/* BOTÃO ENTRAR: Aqui podemos usar o #128C7E (Secondary) ou #25D366 (Tertiary) */}
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            // Usando a cor Secundária (Médio) para o botão principal
            buttonColor={theme.colors.secondary} 
            textColor={theme.colors.onSecondary}
            style={{ marginTop: 16, borderRadius: 8 }}
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{ fontSize: 16, fontWeight: '600' }}
          >
            Entrar
          </Button>

          {/* CADASTRE-SE: Usando o Verde Vibrante (#25D366) ou o Médio para o link */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 24,
          }}>
            <Text style={{ fontSize: 14, color: '#666' }}>Não tem uma conta? </Text>
            <Button
              mode="text"
              onPress={() => console.log('Cadastre-se')}
              // Destaque no texto com a cor Secundária
              textColor={theme.colors.secondary}
              compact
              style={{ marginLeft: -8 }}
            >
              Cadastre-se
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}