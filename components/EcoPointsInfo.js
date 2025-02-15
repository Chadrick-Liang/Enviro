import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Button,
} from 'react-native';

const EcoPointsInfo = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleModal}>
        <Text style={styles.infoText}>How do I earn Eco Points?</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How do I earn Eco Points?</Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Walking:</Text> Walk at least 400 meters in 15 minutes with a speed under 5 km/h instead of using public transport. You'll earn 0.75 Eco Points for each meter a car would have traveled between your start and end points, capping at 60 points per day!
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Recycling:</Text> Take pictures of recyclable materials. Earn 5 points for each new material and 3 points for each repeated material, capping at 3 materials a day!
            </Text>
            <Button title="Close" color={'green'} style={{backgroundColor: 'green'}} onPress={toggleModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  infoText: {
    fontSize: 10,
    color: '#1E90FF',
    textDecorationLine: 'underline',
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default EcoPointsInfo;
