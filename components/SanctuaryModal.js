import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Button,
} from "react-native";
import SanctuaryAnimation from "./SanctuaryAnimation";
import { ViewSanctuary } from "../pages/MySanctuary";

const SanctuaryModal = ({ points, name }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleModal}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={toggleModal}
        >
          <View style={{ position: "absolute", bottom: 20, zIndex: 2, right: 20}} onPress={()=>toggleModal()}>
            <Text style={{color: 'white', fontSize: 20, fontWeight: 800}} onPress={()=> toggleModal()}>Back to Leaderboard</Text>
          </View>
          <ViewSanctuary points={points} name={name} />
        </Modal>
        <Text
          style={{
            color: "#228c22",
          }}
        >
          Visit Sanctuary
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  infoText: {
    fontSize: 10,
    color: "#1E90FF",
    textDecorationLine: "underline",
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
});

export default SanctuaryModal;
