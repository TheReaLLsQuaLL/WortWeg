import * as Speech from 'expo-speech';

export const speakGerman = (text: string) => {
  Speech.stop();
  Speech.speak(text, {
    language: 'de-DE',
    pitch: 1,
    rate: 0.9,
  });
};

export const stopSpeech = () => {
  Speech.stop();
};
