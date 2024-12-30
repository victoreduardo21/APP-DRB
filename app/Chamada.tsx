import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; 

export default function SolicitarChamadaScreen() {
  const navigation = useNavigation();

  const handleSolicitarChamada = () => {
    Alert.alert(
      'Confirmar Solicitação',
      'Deseja realmente solicitar o agendamento?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            console.log('Solicitação de agendamento enviada');
            navigation.navigate('DetalhesChamada'); 
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="user" size={24} color="white" /> 
        </TouchableOpacity>
        <Text style={styles.headerText}>Cavalo</Text> 
        <TouchableOpacity>
          <Icon name="bell" size={24} color="white" /> 
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}> Solicitar Agendamento</Text>
        <TouchableOpacity style={styles.button} onPress={handleSolicitarChamada}>
          <Text style={styles.buttonText}>Enviar solicitação</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', 
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'green',
    padding: 45,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },



  
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 50,
    color: 'white', 
  },
  button: {
    backgroundColor: 'blue',
    padding: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
});
