import React, { useState } from 'react'; // Importa React e useState para gerenciar o estado
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'; // Importa componentes básicos do React Native
import { useNavigation } from '@react-navigation/native'; // Hook para navegação
import Icon from 'react-native-vector-icons/FontAwesome'; // Importa ícones do FontAwesome
import SwipeButton from 'rn-swipe-button';  // Importa a biblioteca para o botão deslizante
import { Colors } from '@/constants/Colors';

export default function SolicitarAgendamentoScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);

  const handleSliderComplete = (action) => {
    Alert.alert(
      'Confirmação',
      `Tem certeza de que deseja confirmar ${action}?`,
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Ação cancelada'),
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            console.log(`${action} confirmada`);
            if (action === 'SaidaDestino') {
              navigation.navigate('SolicitarAgendamento');
            } else {
              setCurrentStep(currentStep + 1);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="bell" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Cavalo</Text>
        <TouchableOpacity>
          <Icon name="user" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.infoText}>Container: CAIU7127597</Text>
        <Text style={styles.infoText}>Origem: Santos Brasil</Text>
        <Text style={styles.infoText}>Destino: Brado</Text>
        <Text style={styles.infoText}>Lacre: CN75707AM</Text>
        <Text style={styles.infoText}>Janela: 01/10/2024 23:20</Text>
      </View>
      {currentStep === 0 && (
        <SwipeButton
          thumbIconBackgroundColor="#FFFFFF"
          railBackgroundColor="#007bff"
          railBorderColor="#FFFFFF"
          title="Deslize para confirmar Chegada Origem"
          onSwipeSuccess={() => handleSliderComplete('Chegada no Terminal de Origem')}
        />
      )}
      {currentStep === 1 && (
        <SwipeButton
          thumbIconBackgroundColor="#FFFFFF"
          railBackgroundColor="#007bff"
          railBorderColor="#FFFFFF"
          title="Deslize para confirmar Saída Origem"
          onSwipeSuccess={() => handleSliderComplete('Saída do Terminal de Origem')}
        />
      )}
      {currentStep === 2 && (
        <SwipeButton
          thumbIconBackgroundColor="#FFFFFF"
          railBackgroundColor="#007bff"
          railBorderColor="#FFFFFF"
          title="Deslize para confirmar Chegada Destino"
          onSwipeSuccess={() => handleSliderComplete('Chegada no Terminal de Destino')}
        />
      )}
      {currentStep === 3 && (
        <SwipeButton
          thumbIconBackgroundColor="#FFFFFF"
          railBackgroundColor="#007bff"
          railBorderColor="#FFFFFF"
          title="Deslize para confirmar Saída Destino"
          onSwipeSuccess={() => handleSliderComplete('Saída do Terminal de Destino')}
        />
      )}
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
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
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },  
  infoText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
  },
});
