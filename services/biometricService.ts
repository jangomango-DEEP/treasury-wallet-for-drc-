
export class BiometricService {
  static isSupported(): boolean {
    return !!(window.PublicKeyCredential && navigator.credentials);
  }

  static async registerBiometrics(username: string): Promise<string | null> {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userID = new Uint8Array(16);
      window.crypto.getRandomValues(userID);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: { name: "Digital Riyal Network", id: window.location.hostname || "localhost" },
        user: {
          id: userID,
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
        authenticatorSelection: { userVerification: "preferred" },
        timeout: 60000,
        attestation: "none",
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      return btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
    } catch (err) {
      console.error("Biometric registration failed", err);
      return null;
    }
  }

  static async authenticate(): Promise<boolean> {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [], // Allow any credential registered on this device for this RP
        userVerification: "required",
        timeout: 60000,
      };

      await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      return true;
    } catch (err) {
      console.error("Biometric authentication failed", err);
      return false;
    }
  }
}
