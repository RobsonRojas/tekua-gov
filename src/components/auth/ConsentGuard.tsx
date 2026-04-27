import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import PrivacyConsentModal from './PrivacyConsentModal';

interface ConsentGuardProps {
  children: React.ReactNode;
}

const ConsentGuard: React.FC<ConsentGuardProps> = ({ children }) => {
  const auth = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (auth?.user && auth?.profile && !auth.loading) {
      // Show modal if user has NOT accepted terms
      if (!auth.profile.accepted_terms_at) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    }
  }, [auth?.user, auth?.profile, auth?.loading]);

  const handleAccept = async () => {
    if (auth?.acceptTerms) {
      await auth.acceptTerms();
      setShowModal(false);
    }
  };

  return (
    <>
      {children}
      <PrivacyConsentModal 
        open={showModal} 
        onAccept={handleAccept} 
      />
    </>
  );
};

export default ConsentGuard;
