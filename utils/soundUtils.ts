import { createAudioPlayer } from 'expo-audio';

// Sound objects using the new expo-audio API
let clickSound: any = null;
let spinningSound: any = null;
let successSound: any = null;

// Initialize sounds
export const initSounds = async () => {
  try {
    console.log('Loading sounds...');
    
    // Create audio players for each sound using createAudioPlayer
    clickSound = createAudioPlayer(require('../assets/sounds/click.mp3'));
    spinningSound = createAudioPlayer(require('../assets/sounds/spinning.mp3'));
    successSound = createAudioPlayer(require('../assets/sounds/success.mp3'));

    console.log('Sounds loaded successfully');
  } catch (error) {
    console.error('Error loading sounds:', error);
  }
};

// Play click sound
export const playClickSound = async () => {
  try {
    if (clickSound) {
      await clickSound.seekTo(0);
      clickSound.play();
    }
  } catch (error) {
    console.error('Error playing click sound:', error);
  }
};

// Play spinning sound
export const playSpinningSound = async () => {
  try {
    if (spinningSound) {
      await spinningSound.seekTo(0);
      spinningSound.play();
    }
  } catch (error) {
    console.error('Error playing spinning sound:', error);
  }
};

// Stop spinning sound
export const stopSpinningSound = async () => {
  try {
    if (spinningSound) {
      spinningSound.pause();
    }
  } catch (error) {
    console.error('Error stopping spinning sound:', error);
  }
};

// Play success sound
export const playSuccessSound = async () => {
  try {
    if (successSound) {
      await successSound.seekTo(0);
      successSound.play();
    }
  } catch (error) {
    console.error('Error playing success sound:', error);
  }
};

// Clean up sounds when app closes
export const unloadSounds = async () => {
  try {
    if (clickSound) clickSound.remove();
    if (spinningSound) spinningSound.remove();
    if (successSound) successSound.remove();
  } catch (error) {
    console.error('Error unloading sounds:', error);
  }
}; 