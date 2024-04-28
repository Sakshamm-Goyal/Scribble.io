const style = document.querySelector('#style');
const bgColor = document.querySelector('#bgColor');
const playerName = document.querySelector('#playerName');
const baseURL = 'https://api.dicebear.com/8.x/';
const my = {
  name: localStorage.getItem('name') || '',
  avatar: localStorage.getItem('avatar') || 'https://api.dicebear.com/8.x/pixel-art/svg?seed=Jane ',
};

const settings = document.createElement('script');
const game = document.createElement('script');
settings.src = 'js/settings.js'; // Assuming settings.js holds additional functionalities
game.src = 'js/game.js'; // Assuming game.js holds game logic
document.body.append(settings, game);

function updateAvatar() {
  const sprite = style.value.toLowerCase();
  const color = bgColor.value.substring(1);
  const url = `${baseURL}${sprite}/svg?b=%23${color}`;

  const avatar = document.querySelector('#avatar');
  avatar.src = url;
  avatar.alt = 'Avatar';
  avatar.classList.add('img-fluid', 'rounded-circle', 'mb-4', 'mb-sm-0');

  my.avatar = url;
  my.name = playerName.value;
  try { // Consider error handling for localStorage access
    localStorage.setItem('name', playerName.value);
    localStorage.setItem('avatar', url);
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
}

window.onload = () => {
  if (localStorage.getItem('avatar')) document.querySelector('#avatar').src = localStorage.getItem('avatar');
  if (localStorage.getItem('name')) playerName.value = localStorage.getItem('name');
};

style.addEventListener('input', updateAvatar);
bgColor.addEventListener('input', updateAvatar);
playerName.addEventListener('input', updateAvatar); // Use input event for name change
