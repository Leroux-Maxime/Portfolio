/**
 * horaire-tracker-auth.js
 * Authentification Google Firebase et gestion de l'utilisateur
 */

const Auth = (() => {

  let _currentUser = null;
  let _unsubscribe = null;

  /* ── Initialisation ── */
  function init() {
    // Écouter les changements d'authentification
    _unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      _currentUser = user;
      _updateAuthUI(user);
      
      // Charger les données de manière asynchrone
      _loadDataAndInit(user);
    });
  }

  /* ── Chargement async des données ── */
  async function _loadDataAndInit(user) {
    try {
      if (user) {
        console.log('✓ Utilisateur connecté:', user.email);
        
        // Charger les données depuis Firestore
        await FirestoreSync.loadFromFirestore();
        await Settings.loadFromFirestore();
        
        // Démarrer la synchro automatique
        if (Sync.isEnabled()) {
          _startAutoSync();
        }
      } else {
        console.log('✗ Utilisateur déconnecté');
        
        // Charger les données locales en fallback
        Store.load();
        Settings.load();
        Sync.load();
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      // Fallback au local en cas d'erreur
      Store.load();
      Settings.load();
    } finally {
      // Initialiser l'app après chargement
      if (window.App?.init) {
        App.init();
      }
    }
  }

  /* ── Connexion Google ── */
  async function loginWithGoogle() {
    try {
      const result = await firebaseAuth.signInWithPopup(googleProvider);
      _currentUser = result.user;
      console.log('✓ Connexion réussie:', _currentUser.email);
      return result.user;
    } catch (error) {
      console.error('✗ Erreur de connexion:', error);
      alert('Erreur de connexion: ' + error.message);
      return null;
    }
  }

  /* ── Déconnexion ── */
  async function logout() {
    try {
      await firebaseAuth.signOut();
      _currentUser = null;
      console.log('✓ Déconnexion réussie');
    } catch (error) {
      console.error('✗ Erreur de déconnexion:', error);
      alert('Erreur de déconnexion: ' + error.message);
    }
  }

  /* ── Getter ── */
  function getCurrentUser() {
    return _currentUser;
  }

  function isAuthenticated() {
    return _currentUser !== null;
  }

  /* ── UI Mise à jour ── */
  function _updateAuthUI(user) {
    const authContainer = document.getElementById('authContainer');
    const loginBtn = document.getElementById('loginBtn');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');

    if (user) {
      authContainer.style.display = 'flex';
      loginBtn.style.display = 'none';
      
      userAvatar.src = user.photoURL || _getDefaultAvatar(user.email);
      userName.textContent = user.displayName || user.email.split('@')[0];
      
      // Ajouter classe pour CSS
      document.body.classList.add('authenticated');
    } else {
      authContainer.style.display = 'none';
      loginBtn.style.display = 'flex';
      document.body.classList.remove('authenticated');
    }
  }

  /* ── Helper: Avatar par défaut ── */
  function _getDefaultAvatar(email) {
    const hash = Math.abs(email.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0));
    return `https://api.dicebear.com/7.x/initials/svg?seed=${hash}&scale=75`;
  }

  /* ── Auto-sync ── */
  function _startAutoSync() {
    // Sync toutes les 30 secondes
    setInterval(() => {
      if (isAuthenticated()) {
        FirestoreSync.syncToFirestore();
      }
    }, 30000);
  }

  /* ── Public API ── */
  return {
    init,
    loginWithGoogle,
    logout,
    getCurrentUser,
    isAuthenticated,
  };

})();

// Initialiser l'auth au chargement
document.addEventListener('DOMContentLoaded', () => Auth.init());
