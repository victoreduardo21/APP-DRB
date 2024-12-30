import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = () => {
    axios.post('http://192.168.0.101:8000/drb_logistica_backend/api/login_motorista/', {
      placa: username,
      cpf: password
    })
    .then(response => {
      const { status, dados } = response.data;
      if (status === 'sucesso') {
        Alert.alert('Login bem-sucedido', 'Bem-vindo!');
        navigation.navigate('Chamada');
      } else {
        Alert.alert('Falha no login', response.data.mensagem);
      }
    })
    .catch(error => {
      if (error.response) {
        // Erros que possuem resposta do servidor
        Alert.alert('Erro', error.response.data.mensagem || 'Erro no servidor');
      } else if (error.request) {
        // Erros que ocorrem devido à falta de resposta do servidor
        Alert.alert('Erro', 'Servidor não respondeu. Verifique sua conexão.');
      } else {
        // Erros em outras partes da solicitação
        Alert.alert('Erro', error.message);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Placa"
        value={username}
        onChangeText={setUsername}
        maxLength={7}
      />
      <TextInput
        style={styles.input}
        placeholder="CPF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        maxLength={11}
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#F0F8FF',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  loginButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: '80%',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});