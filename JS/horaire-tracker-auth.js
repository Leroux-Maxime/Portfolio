/**
 * horaire-tracker-auth.js
 * Authentification Google Firebase et gestion de l'utilisateur
 */

const Auth = (() => {

  let _currentUser = null;
  let _unsubscribe = null;
  let _autoSyncTimer = null;

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

        // Toujours charger le local avant de fusionner avec le cloud
        Store.load();
        Settings.load();

        // Charger et fusionner les données cloud/local puis republier l'état fusionné
        if (window.App?.setSyncStatus) {
          App.setSyncStatus('syncing', 'Synchro: en cours...');
        }
        await FirestoreSync.syncNow();
        if (window.App?.setSyncStatus) {
          App.setSyncStatus('success', `Synchro: OK (${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`);
        }
        await Settings.loadFromFirestore();
        
        // Démarrer la synchro automatique Firebase
        _startAutoSync();
      } else {
        console.log('✗ Utilisateur déconnecté');
        _stopAutoSync();
        
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
      // Cas fréquent : domaine non autorisé pour OAuth
      if (error && error.code === 'auth/unauthorized-domain') {
        const projectId = (typeof firebaseConfig !== 'undefined' && firebaseConfig.projectId) ? firebaseConfig.projectId : '(votre-projet)';
        const msg = `Erreur: domaine non autorisé pour OAuth.\n\nAjoutez 'localhost' (ou votre domaine) dans Firebase Console → Authentication → Authorized domains.`;
        alert(msg);
        // Ouvrir la page d'auth providers dans la console Firebase pour aide rapide
        try { window.open(`https://console.firebase.google.com/project/${projectId}/authentication/providers`, '_blank'); } catch (e) { /* ignore */ }
        return null;
      }

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
    return _currentUser || firebaseAuth.currentUser || null;
  }

  function isAuthenticated() {
    return Boolean(getCurrentUser());
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

      // Nom
      userName.textContent = user.displayName || (user.email ? user.email.split('@')[0] : 'Utilisateur');

      // Avatar: définir alt, policy et fallback (sensible pour Safari)
      userAvatar.alt = user.displayName || user.email || 'Avatar';
      userAvatar.referrerPolicy = 'no-referrer';
      try { userAvatar.crossOrigin = 'anonymous'; } catch (e) { /* ignore */ }

      // Handler onload/onerror
      let _avatarTimer = null;
      userAvatar.onload = () => {
        if (_avatarTimer) { clearTimeout(_avatarTimer); _avatarTimer = null; }
        // image chargée correctement
      };
      userAvatar.onerror = () => {
        userAvatar.onerror = null;
        userAvatar.src = _getDefaultAvatar(user.email || (user.uid || Math.random()));
      };

      // Assign source ou fallback
      if (user.photoURL) {
        // tenter la photo Google (ajout taille suggérée)
        try {
          userAvatar.src = user.photoURL + (user.photoURL.includes('?') ? '&' : '?') + 'sz=128';
        } catch (e) {
          userAvatar.src = _getDefaultAvatar(user.email || (user.uid || Math.random()));
        }
      } else {
        userAvatar.src = _getDefaultAvatar(user.email || (user.uid || Math.random()));
      }

      // Fallback si l'image met trop de temps à charger (ex: bloquée par Safari)
      _avatarTimer = setTimeout(() => {
        if (!userAvatar.complete || userAvatar.naturalWidth === 0) {
          userAvatar.src = _getDefaultAvatar(user.email || (user.uid || Math.random()));
        }
      }, 2500);

      // Forcer l'affichage et ajouter classe pour CSS
      userAvatar.style.display = 'block';
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
    if (_autoSyncTimer) return;
    // Sync toutes les 30 secondes
    _autoSyncTimer = setInterval(() => {
      if (isAuthenticated()) {
        if (window.App?.setSyncStatus) {
          App.setSyncStatus('syncing', 'Synchro: en cours...');
        }
        FirestoreSync.syncNow()
          .then(() => {
            if (window.App?.setSyncStatus) {
              App.setSyncStatus('success', `Synchro: OK (${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`);
            }
          })
          .catch(() => {
            if (window.App?.setSyncStatus) {
              App.setSyncStatus('error', 'Synchro: erreur');
            }
          });
      }
    }, 30000);
  }

  function _stopAutoSync() {
    if (_autoSyncTimer) {
      clearInterval(_autoSyncTimer);
      _autoSyncTimer = null;
    }
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
