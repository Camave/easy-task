import React, { useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Asset, ImageLibraryOptions, launchImageLibrary, MediaType } from 'react-native-image-picker';


type FormData = {
  title: string;
  description: string;
  prerequisites: string;
  dateTime: string;
  location: string;
  remuneration: string;
  photos: string[];
};

const EasyTasksApp: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    prerequisites: '',
    dateTime: '',
    location: '',
    remuneration: '',
    photos: []
  });

  const [showThemes, setShowThemes] = useState<boolean>(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = () => {
    const options: ImageLibraryOptions = {
        mediaType: 'photo' as MediaType, // TypeScript l'infère comme 'photo' | 'video' | 'mixed'
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
        selectionLimit: 0
    };


    launchImageLibrary(options, (response) => {
      if (response.assets) {
        const newPhotos = response.assets.map((asset: Asset) => asset.uri!).filter(Boolean);
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...newPhotos]
        }));
      }
    });
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const isFormValid: boolean =
    formData.title !== '' &&
    formData.description !== '' &&
    formData.dateTime !== '' &&
    formData.location !== '';

  const handleSubmit = () => {
    if (!isFormValid) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    console.log('Tâche soumise:', formData);
    Alert.alert('Succès', 'Tâche créée avec succès ! 🎉');
    // TODO: Envoyer les données à ton backend ici
  };

  const themes: string[] = ['Jardinage', 'Ménage', 'Transport', 'Bricolage', 'Cuisine', 'Autre'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" /> 

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>EASY TASKS</Text>
          <Text style={styles.subtitle}>Demande de l'aide</Text>
        </View>

        <TouchableOpacity style={styles.photoUpload} onPress={handlePhotoUpload}>
          <Text style={styles.plusIcon}>+</Text>
          <Text style={styles.photoText}>Ajouter photos</Text>
        </TouchableOpacity>

        {formData.photos.length > 0 && (
          <View style={styles.photosGrid}>
            {formData.photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePhoto(index)}
                >
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.formContainer}>
          {[
            { label: 'Titre :', placeholder: 'ex : Tondre ma pelouse', key: 'title' },
            {
              label: 'Décris ta tâche :',
              placeholder: 'ex : J\'ai besoin de tondre ma pelouse que vous pouvez voir juste au dessus',
              key: 'description',
              multiline: true,
              numberOfLines: 3
            },
            {
              label: 'Prérequis de ta tâche :',
              placeholder: 'ex : Vous devez avoir une tondeuse',
              key: 'prerequisites',
              multiline: true,
              numberOfLines: 2
            },
            {
              label: '📅 Dates et horaire :',
              placeholder: 'ex : Jeudi 13 janvier 13-15h',
              key: 'dateTime'
            },
            {
              label: '📍 Lieu :',
              placeholder: 'ex : 5958 av. chateaubriand Montréal',
              key: 'location'
            },
            {
              label: '💰 Rémunération :',
              placeholder: 'ex : 35$/h : 70$',
              key: 'remuneration'
            }
          ].map(({ label, placeholder, key, multiline, numberOfLines }) => (
            <View key={key} style={styles.fieldContainer}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={[styles.input, multiline && styles.textArea]}
                onChangeText={(text) =>
                  handleInputChange(key as keyof FormData, text)
                }
                placeholder={placeholder}
                placeholderTextColor="#999"
                multiline={multiline}
                numberOfLines={numberOfLines}
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.themeButton}
            onPress={() => setShowThemes(!showThemes)}
          >
            <Text style={styles.themeText}>Thème</Text>
            <Text style={styles.arrow}>^</Text>
          </TouchableOpacity>

          {showThemes && (
            <View style={styles.themesContainer}>
              <View style={styles.themesGrid}>
                {themes.map((theme) => (
                  <TouchableOpacity key={theme} style={styles.themeItem}>
                    <Text style={styles.themeItemText}>{theme}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid}
          >
            <Text style={styles.submitText}>📤 Créer la tâche</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Ton StyleSheet reste inchangé (copie ton style ici)


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 8,
  },
  bar: {
    width: 3,
    backgroundColor: '#000',
    marginHorizontal: 1,
  },
  battery: {
    width: 24,
    height: 12,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  photoUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#f8faff',
  },
  plusIcon: {
    fontSize: 20,
    color: '#3b82f6',
    marginRight: 8,
  },
  photoText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  themeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
  },
  themeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  arrow: {
    fontSize: 18,
    color: '#999',
  },
  themesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeItem: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  themeItemText: {
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  activeNavItem: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
  },
  navIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
  },
  navIconBorder: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
  },
  navIconRound: {
    width: 24,
    height: 24,
    backgroundColor: '#d1d5db',
    borderRadius: 12,
  },
  navText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default EasyTasksApp;